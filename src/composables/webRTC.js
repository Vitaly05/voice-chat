import { ref, watchEffect } from 'vue';
import { apiSignal } from '@/api.js';
import { callStates, useCallStore } from '@/stores/callStore.js';

export function useWebRTC() {
  const localVideoRef = ref(null);
  const remoteVideoRef = ref(null);
  const remoteAudioRef = ref(null);

  const currentUserId = ref(null);
  const remoteUserId = ref(null);

  const peerConnection = ref(null);
  const iceCandidatesQueue = [];

  const videoTransceiver = ref(null);
  const audioTransceiver = ref(null);

  const localMediaStream = { video: null, audio: null };

  const callStore = useCallStore();

  async function initPeerConnection(_currentUserId, _remoteUserId) {
    currentUserId.value = _currentUserId;
    remoteUserId.value = _remoteUserId;

    peerConnection.value = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    videoTransceiver.value = peerConnection.value.addTransceiver('video', {
      direction: 'sendrecv',
    });
    audioTransceiver.value = peerConnection.value.addTransceiver('audio', {
      direction: 'sendrecv',
    });

    peerConnection.value.ontrack = (event) => {
      const stream = event.streams[0] || new MediaStream([event.track]);

      if (event.track.kind === 'video') {
        remoteVideoRef.value.srcObject = stream;

        event.track.onmute = () => {
          remoteVideoRef.value.srcObject = null;
        };

        event.track.onunmute = () => {
          remoteVideoRef.value.srcObject = stream;
        };
      } else {
        remoteAudioRef.value.srcObject = stream;
      }
    };

    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        apiSignal(remoteUserId.value, event.candidate);
      }
    };

    peerConnection.value.onconnectionstatechange = async (event) => {
      switch (peerConnection.value.connectionState) {
        case 'connected':
          callStore.setState(callStates.call);

          if (callStore.isCallAccepted) {
            await toggleMicrophone(true)
            await signalOffer();
          }

          break;
      }
    };

    setupEchoListeners();
  }

  function setupEchoListeners() {
    // eslint-disable-next-line no-undef
    Echo.private(`Chat.${currentUserId.value}`).listen('.signal', async (event) => {
      const { data } = event;

      if (data.candidate) {
        const candidate = new RTCIceCandidate(data);

        if (peerConnection.value && peerConnection.value.remoteDescription) {
          await peerConnection.value.addIceCandidate(candidate);
        } else {
          iceCandidatesQueue.push(candidate);
        }
      } else if (data.sdp) {
        await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data));

        if (data.type === 'offer') {
          const answer = await peerConnection.value.createAnswer();
          await peerConnection.value.setLocalDescription(answer);
          await apiSignal(remoteUserId.value, peerConnection.value.localDescription);
        }

        await processIceQueue();
      }
    });
  }

  function closeConnection() {
    if (!peerConnection.value) {
      return;
    }

    const senders = peerConnection.value.getSenders();

    senders.forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    peerConnection.value.close();

    peerConnection.value.ontrack = null;
    peerConnection.value.onicecandidate = null;
    peerConnection.value.onconnectionstatechange = null;
    peerConnection.value = null;

    Echo.private(`Chat.${currentUserId.value}`).stopListening('.signal');
  }

  async function processIceQueue() {
    while (iceCandidatesQueue.length > 0) {
      const candidate = iceCandidatesQueue.shift();
      await peerConnection.value.addIceCandidate(candidate);
    }
  }

  async function acceptCall() {
    if (!peerConnection.value) {
      return;
    }

    await toggleMicrophone(true);
    await signalOffer();
  }

  function cancelCall() {
    closeConnection();
  }

  async function toggleMicrophone(enabled) {
    if (enabled) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localMediaStream.audio = stream;

      const track = stream.getAudioTracks()[0];
      await audioTransceiver.value.sender.replaceTrack(track);
    } else {
      if (localMediaStream.audio) {
        localMediaStream.audio.getTracks().forEach((t) => t.stop());
      }

      await audioTransceiver.value.sender.replaceTrack(null);
    }
  }

  async function toggleCamera(enabled) {
    if (enabled) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      localMediaStream.video = stream;
      localVideoRef.value.srcObject = stream;

      const track = stream.getVideoTracks()[0];

      videoTransceiver.value.direction = 'sendrecv';
      await videoTransceiver.value.sender.replaceTrack(track);
    } else {
      if (localMediaStream.video) {
        localMediaStream.video.getTracks().forEach((t) => t.stop());
      }

      localVideoRef.value.srcObject = null;

      videoTransceiver.value.direction = 'recvonly';
      await videoTransceiver.value.sender.replaceTrack(null);
    }

    if (peerConnection.value?.signalingState === 'stable') {
      await signalOffer();
    }
  }

  async function signalOffer() {
    const offer = await peerConnection.value.createOffer();
    await peerConnection.value.setLocalDescription(offer);
    await apiSignal(remoteUserId.value, peerConnection.value.localDescription);
  }

  return {
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    peerConnection,
    initPeerConnection,
    acceptCall,
    cancelCall,
    toggleMicrophone,
    toggleCamera,
  };
}
