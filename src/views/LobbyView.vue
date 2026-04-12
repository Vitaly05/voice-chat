<template>
  <main>Lobby</main>

  <button @click="test">Test</button>
</template>

<script setup>
import { apiSignal } from '@/api.js';

async function test() {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  peerConnection.ontrack = (event) => {
    console.log(event);
  };

  apiSignal(0, {})

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      apiSignal(1, { candidate: event.candidate });
    }
  };

  Echo.private(`user.${0}`).listen('.signal', async (event) => {
    const { data } = event;

    if (data.sdp) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      if (data.sdp.type === 'offer') {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await apiSignal(1, { sdp: answer });
      }
    } else if (data.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  });
}
</script>
