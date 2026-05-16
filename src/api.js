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

async function apiGetAllFriends() {
  try {
    const response = await instance.get('user/get-all-friends');

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiGetCurrentUserInfo() {
  try {
    const response = await instance.get('user/get-info');

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiStartCall(recipientId) {
  try {
    const response = await instance.post('chat/start-call', {
      recipient_id: recipientId,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiAcceptCall(senderId) {
  try {
    const response = await instance.post('chat/accept-call', {
      sender_id: senderId,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiRejectCall(senderId) {
  try {
    const response = await instance.post('chat/reject-call', {
      sender_id: senderId,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiCancelCall(senderId) {
  try {
    const response = await instance.post('chat/cancel-call', {
      sender_id: senderId,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiAddFriend(name) {
  try {
    const response = await instance.post('user/add-friend', {
      name: name,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiGetFriendshipRequests() {
  try {
    const response = await instance.get('user/get-friendship-requests');

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiAcceptFriendshipRequest(userId) {
  try {
    const response = await instance.post('user/accept-friendship-request', {
      user_id: userId,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiRejectFriendshipRequest(userId) {
  try {
    const response = await instance.post('user/reject-friendship-request', {
      user_id: userId,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiGetNotificationsCount() {
  try {
    const response = await instance.get('user/get-notifications-count');

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

async function apiRemoveFriend(userId) {
  try {
    const response = await instance.post('user/remove-friend', {
      user_id: userId,
    });

    return response.data;
  } catch (e) {
    console.error('Request error: ' + e.message);
  }
}

export {
  apiBroadcastAuthorizer,
  apiRegister,
  apiLoginByName,
  apiSignal,
  apiGetAllFriends,
  apiGetCurrentUserInfo,
  apiStartCall,
  apiAcceptCall,
  apiRejectCall,
  apiCancelCall,
  apiAddFriend,
  apiGetFriendshipRequests,
  apiAcceptFriendshipRequest,
  apiRejectFriendshipRequest,
  apiGetNotificationsCount,
  apiRemoveFriend,
};
