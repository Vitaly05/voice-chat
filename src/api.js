import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

async function apiSignal(remoteUserId, data) {
  try {
    await instance.post('signal', {
      receiverId: remoteUserId,
      data: data,
    });
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

export { apiSignal };
