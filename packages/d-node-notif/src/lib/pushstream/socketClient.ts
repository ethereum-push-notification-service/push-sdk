import { io } from 'socket.io-client';
import { getCAIPAddress } from '../helpers';
import { SocketInputOptions } from './pushStreamTypes';
import { getAPIBaseUrls } from '../helpers';

export async function createSocketConnection({
  user,
  env,
  socketOptions,
}: SocketInputOptions) {
  const {
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay,
    reconnectionDelayMax,
  } = socketOptions || {};

  let pushWSUrl = await getAPIBaseUrls(env);

  if (pushWSUrl.endsWith('/apis')) {
    pushWSUrl = pushWSUrl.substring(0, pushWSUrl.length - 5);
  }
  const transports = ['websocket'];

  let pushSocket = null;

  try {
    const userAddressInCAIP = await getCAIPAddress(env, user, 'User');
    const query = { address: userAddressInCAIP };

    pushSocket = io(pushWSUrl, {
      transports,
      query,
      autoConnect,
      reconnectionAttempts,
      ...(reconnectionDelay !== undefined && { reconnectionDelay }),
      ...(reconnectionDelayMax !== undefined && { reconnectionDelayMax }),
    });
  } catch (e) {
    console.error('[PUSH-SDK] - Socket connection error: ', e);
  }

  return pushSocket;
}
