<template>
  <main>Lobby</main>

  <button @click="startCall">Call</button>

  <video ref="localVideoRef" autoplay playsinline muted />
  <video ref="remoteVideoRef" autoplay playsinline muted />

  <audio ref="remoteAudioRef" autoplay />
</template>

<script setup>
import { apiSendAnswer, apiSendCandidate, apiSendOffer } from '@/api.js';
import { onMounted, ref } from 'vue';

const localVideoRef = ref(null);
const remoteVideoRef = ref(null);
const remoteAudioRef = ref(null);

let peerConnection = null;
const iceCandidatesQueue = [];

onMounted(() => {
  initPeerConnection();
});

async function initPeerConnection() {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });
  const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioStream.getTracks().forEach((track) => peerConnection.addTrack(track, audioStream));
  videoStream.getTracks().forEach((track) => peerConnection.addTrack(track, videoStream));

  localVideoRef.value.srcObject = videoStream;

  peerConnection.ontrack = (event) => {
    const remoteStream = event.streams[0];

    if (event.track.kind === 'video') {
      remoteVideoRef.value.srcObject = remoteStream;
    } else if (event.track.kind === 'audio') {
      remoteAudioRef.value.srcObject = remoteStream;
    }
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      await apiSendCandidate(event.candidate);
    }
  };

  setupEchoListeners();
}

function setupEchoListeners() {
  const channel = Echo.private(`Chat.${0}`);

  channel.listen('.send-offer', async (event) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription({
        type: 'offer',
        sdp: event.offer.sdp,
      }),
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    await apiSendAnswer(peerConnection.localDescription);

    await processIceQueue();
  });

  channel.listen('.send-answer', async (event) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription({
        type: 'answer',
        sdp: event.answer.sdp,
      }),
    );

    await processIceQueue();
  });

  channel.listen('.new-ice-candidate', async (event) => {
    const candidate = new RTCIceCandidate(event.candidate);

    if (peerConnection && peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(candidate);
    } else {
      iceCandidatesQueue.push(candidate);
    }
  });
}

async function processIceQueue() {
  while (iceCandidatesQueue.length > 0) {
    const candidate = iceCandidatesQueue.shift();
    await peerConnection.addIceCandidate(candidate);
  }
}

async function startCall() {
  if (!peerConnection) {
    await initPeerConnection();
  }

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  await apiSendOffer(peerConnection.localDescription);
}
</script>
