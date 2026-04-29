import { onMounted, ref } from 'vue';
import { apiSignal } from '@/api.js';

export function useWebRTC() {
  const localVideoRef = ref(null);
  const remoteVideoRef = ref(null);
  const remoteAudioRef = ref(null);

  const currentUserId = ref(null);
  const remoteUserId = ref(null);

  const peerConnection = ref(null);
  const iceCandidatesQueue = [];

  const videoStream = ref(null);
  const audioStream = ref(null);

  onMounted(async () => {
    videoStream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    audioStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
  });

  async function initPeerConnection(_currentUserId, _remoteUserId) {
    currentUserId.value = _currentUserId;
    remoteUserId.value = _remoteUserId;

    peerConnection.value = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    audioStream.value.getTracks().forEach((track) => peerConnection.value.addTrack(track, audioStream.value));
    videoStream.value.getTracks().forEach((track) => peerConnection.value.addTrack(track, videoStream.value));

    localVideoRef.value.srcObject = videoStream.value;

    peerConnection.value.ontrack = (event) => {
      const remoteStream = event.streams[0];

      if (event.track.kind === 'video') {
        remoteVideoRef.value.srcObject = remoteStream;
      } else if (event.track.kind === 'audio') {
        remoteAudioRef.value.srcObject = remoteStream;
      }
    };

    peerConnection.value.onicecandidate = async (event) => {
      if (event.candidate) {
        await apiSignal(remoteUserId.value, event.candidate);
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
  };
}
