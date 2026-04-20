import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.js';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

instance.interceptors.request.use(
  function (config) {
    const authStore = useAuthStore();

    if (authStore.isAuthenticated) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore().clearAccessToken();
      window.location.href = '/login';
    }

    if (error.response && error.response.status === 422) {
      return Promise.resolve(error.response);
    }

    return Promise.reject(error);
  },
);

const apiBroadcastAuthorizer = (channel, options) => {
  return {
    authorize: (socketId, callback) => {
      instance
        .post(`https://${import.meta.env.VITE_REVERB_HOST}/v1/broadcasting/auth`, {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((response) => {
          callback(false, response.data);
        })
        .catch((error) => {
          callback(true, error.response);
        });
    },
  };
};

async function apiRegister({ name, password }) {
  try {
    const response = await instance.post('auth/register', {
      name: name,
      password: password,
    });

    return response.data;
  } catch (e) {
    console.error(e.message);
  }
}

async function apiLoginByName({ name, password }) {
  try {
    const response = await instance.post('auth/login-name', {
      name: name,
      password: password,
    });

    return response.data;
  } catch (e) {
    console.error(e.message);
  }
}

async function apiSignal(remoteUserId, data) {
  try {
    await instance.post(
      'chat/signal',
      {
        receiverId: remoteUserId,
        data: data,
      },
      {
        headers: {
          'X-Socket-ID': Echo.socketId(),
        },
      },
    );
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

// async function apiSendCandidate(candidate) {
//   try {
//     await instance.post(
//       'chat/new-ice-candidate',
//       {
//         candidate: candidate,
//       },
//       {
//         headers: {
//           'X-Socket-ID': Echo.socketId(),
//         },
//       },
//     );
//   } catch (e) {
//     console.error('Request error: ' + e.message);
//   }
// }
//
// async function apiSendOffer(offer) {
//   try {
//     await instance.post(
//       'chat/send-offer',
//       {
//         offer: offer,
//       },
//       {
//         headers: {
//           'X-Socket-ID': Echo.socketId(),
//         },
//       },
//     );
//   } catch (e) {
//     console.error('Request error: ' + e.message);
//   }
// }
//
// async function apiSendAnswer(answer) {
//   try {
//     await instance.post(
//       'chat/send-answer',
//       {
//         answer: answer,
//       },
//       {
//         headers: {
//           'X-Socket-ID': Echo.socketId(),
//         },
//       },
//     );
//   } catch (e) {
//     console.error('Request error: ' + e.message);
//   }
// }

export {
  apiBroadcastAuthorizer,
  apiRegister,
  apiLoginByName,
  apiSignal,
  // apiSendCandidate,
  // apiSendOffer,
  // apiSendAnswer,
};
