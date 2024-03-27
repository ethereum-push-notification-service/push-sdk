import * as PushAPI from '@pushprotocol/restapi';
import { createSocketConnection, EVENTS } from '@pushprotocol/socket';
import { ethers } from 'ethers';
import { config } from '../config';

import { createWalletClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
  DEV = 'dev',
  /**
   * **This is for local development only**
   */
  LOCAL = 'local',
}

// CONFIGS
const { env, showAPIResponse } = config;

// If you own a channel, you can use your channel address as well
const channelPrivateKey = process.env.WALLET_PRIVATE_KEY;

/***************** SAMPLE SIGNER GENERATION *********************/
/**
 * USING VIEM
 */
const signerChannel = channelPrivateKey
  ? createWalletClient({
      account: privateKeyToAccount(`0x${channelPrivateKey}`),
      chain: sepolia,
      transport: http(),
    })
  : undefined;
const channelAddress = signerChannel
  ? signerChannel.account.address
  : undefined;
// Random Wallet Signers
const signer = createWalletClient({
  account: privateKeyToAccount(generatePrivateKey()),
  chain: sepolia,
  transport: http(),
});
const signerAddress = signer.account.address;
// Dummy Wallet Addresses
const randomWallet1 = privateKeyToAccount(generatePrivateKey()).address;

/**
 * USING ETHERS
 */
// const signerChannel = new ethers.Wallet(`0x${channelPrivateKey}`);
// const channelAddress = signerChannel.address;
// // Random Wallet Signers
// const signer = ethers.Wallet.createRandom();
// const signerAddress = signer.address;
// // Dummy Wallet Addresses
// const randomWallet1 = ethers.Wallet.createRandom().address;
/************************************************************* */

const skipExample = () => {
  const requiredEnvVars = ['WALLET_PRIVATE_KEY'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      return true; // Skip the example if any of the required env vars is missing
    }
  }

  return false; // All required env vars are present, don't skip the example
};

// Push Notification - Run Notifications Use cases
export const runNotificaitonsLowLevelUseCases = async (): Promise<void> => {
  console.log('PushAPI.user.getFeeds');
  await PushAPI_user_getFeeds();

  console.log('PushAPI.user.getFeeds [Spam]');
  await PushAPI_user_getFeeds__spam();

  console.log('PushAPI.user.getSubscriptions');
  await PushAPI_user_getSubscriptions();

  if (!skipExample()) {
    console.log('PushAPI.channels.getChannel()');
    await PushAPI_channels_getChannel();

    console.log('PushAPI.channels.search()');
    await PushAPI_channels_search();

    console.log('PushAPI.channels.subscribe()');
    await PushAPI_channels_subscribe();

    console.log('PushAPI.channels.unsubscribe()');
    await PushAPI_channels_unsubscribe();

    // IMPORTANT: VARIOUS OTHER NOTIFICATIONS FORMAT SUPPORTED
    // EXAMPLES HERE: https://github.com/push-protocol/push-sdk/blob/main/packages/restapi/README.md
    console.log(
      'PushAPI.payloads.sendNotification() [Direct Payload, Single Recipient]'
    );
    await PushAPI_payloads_sendNotification__direct_payload_single_recipient();

    console.log(
      'PushAPI.payloads.sendNotification() [Direct Payload, Batch of Recipients (Subset)]'
    );
    await PushAPI_payloads_sendNotification__direct_payload_group_of_recipient_subset();

    console.log(
      'PushAPI.payloads.sendNotification() [Direct Payload, All Recipients (Broadcast)]'
    );
    await PushAPI_payloads_sendNotification__direct_payload_all_recipients_brodcast();

    console.log('PushAPI.channels._getSubscribers()');
    await PushAPI_channels_getSubscribers();

    /**
     * @notice - can only be used with ethersV5
     */
    // console.log('Push Notification - PushSDKSocket()');
    // await PushSDKSocket();
  }
};

// Push Notification - PushAPI.user.getFeeds
async function PushAPI_user_getFeeds(silent = !showAPIResponse) {
  const notifications = await PushAPI.user.getFeeds({
    user: `eip155:11155111:${signerAddress}`, // user address in CAIP
    env: env as ENV,
  });

  console.log('PushAPI.user.getFeeds | Response - 200 OK');
  if (!silent) {
    console.log(notifications);
  }
}

// Push Notification - PushAPI.user.getFeeds - Spam
async function PushAPI_user_getFeeds__spam(silent = !showAPIResponse) {
  const notifications = await PushAPI.user.getFeeds({
    user: `eip155:11155111:${signerAddress}`, // user address in CAIP
    spam: true,
    env: env as ENV,
  });

  console.log('PushAPI.user.getFeeds [Spam] | Response - 200 OK');
  if (!silent) {
    console.log(notifications);
  }
}

// Push Notification - PushAPI.user.getSubscriptions
async function PushAPI_user_getSubscriptions(silent = !showAPIResponse) {
  const subscriptions = await PushAPI.user.getSubscriptions({
    user: `eip155:11155111:${signerAddress}`, // user address in CAIP
    env: env as ENV,
  });

  console.log('PushAPI.user.getSubscriptions | Response - 200 OK');
  if (!silent) {
    console.log(subscriptions);
  }
}

// Push Notification - PushAPI.channels.getChannel
async function PushAPI_channels_getChannel(silent = !showAPIResponse) {
  const channelData = await PushAPI.channels.getChannel({
    channel: channelAddress as string,
    env: env as ENV,
  });

  console.log('PushAPI.channels.getChannel | Response - 200 OK');
  if (!silent) {
    console.log(channelData);
  }
}

// Push Notification - PushAPI.channels.search
async function PushAPI_channels_search(silent = !showAPIResponse) {
  const channelsData = await PushAPI.channels.search({
    query: 'push', // a search query
    page: 1, // page index
    limit: 20, // no of items per page
    env: env as ENV,
  });

  console.log('PushAPI.channels.search | Response - 200 OK');
  if (!silent) {
    console.log(channelsData);
  }
}

// Push Notification - PushAPI.channels.subscribe
async function PushAPI_channels_subscribe(silent = !showAPIResponse) {
  const response = await PushAPI.channels.subscribe({
    signer: signer,
    channelAddress: `eip155:11155111:${channelAddress}`, // channel address in CAIP
    userAddress: `eip155:11155111:${signerAddress}`, // user address in CAIP
    onSuccess: () => {
      console.log('opt in success');
    },
    onError: () => {
      console.error('opt in error');
    },
    env: env as ENV,
  });

  console.log('PushAPI.channels.subscribe | Response - 200 OK');
  if (!silent) {
    console.log(response);
  }
}

// Push Notification - PushAPI.channels.unsubscribe
async function PushAPI_channels_unsubscribe(silent = !showAPIResponse) {
  const response = await PushAPI.channels.unsubscribe({
    signer: signer,
    channelAddress: `eip155:11155111:${channelAddress}`, // channel address in CAIP
    userAddress: `eip155:11155111:${signerAddress}`, // user address in CAIP
    onSuccess: () => {
      console.log('opt out success');
    },
    onError: () => {
      console.error('opt out error');
    },
    env: env as ENV,
  });

  console.log('PushAPI.channels.unsubscribe | Response - 200 OK');
  if (!silent) {
    console.log(response);
  }
}

// Push Notification - Send Notifications
// Direct payload for single recipient(target)
// PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_single_recipient(
  silent = !showAPIResponse
) {
  const apiResponse = await PushAPI.payloads.sendNotification({
    signer: signerChannel, // Need to resolve to channel address
    type: 3, // target
    identityType: 2, // direct payload
    notification: {
      title: `notification TITLE:`,
      body: `notification BODY`,
    },
    payload: {
      title: `payload title`,
      body: `sample msg body`,
      cta: '',
      img: '',
    },
    recipients: `eip155:11155111:${signerAddress}`, // recipient address
    channel: `eip155:11155111:${channelAddress}`, // your channel address
    env: env as ENV,
  });

  console.log('PushAPI.payloads.sendNotification | Response - 204 OK');
  if (!silent) {
    console.log(apiResponse);
  }
}

// Push Notification - Direct payload for group of recipients(subset)
// PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_group_of_recipient_subset(
  silent = !showAPIResponse
) {
  const apiResponse = await PushAPI.payloads.sendNotification({
    signer: signerChannel, // Need to resolve to channel address
    type: 4, // subset
    identityType: 2, // direct payload
    notification: {
      title: `notification TITLE:`,
      body: `notification BODY`,
    },
    payload: {
      title: `payload title`,
      body: `sample msg body`,
      cta: '',
      img: '',
    },
    recipients: [
      `eip155:11155111:${signerAddress}`,
      `eip155:11155111:${randomWallet1}`,
    ], // recipient addresses
    channel: `eip155:11155111:${channelAddress}`, // your channel address
    env: env as ENV,
  });

  console.log('PushAPI.payloads.sendNotification | Response - 204 OK');
  if (!silent) {
    console.log(apiResponse);
  }
}

// Push Notification - Direct payload for all recipients(broadcast)
// PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_all_recipients_brodcast(
  silent = !showAPIResponse
) {
  const apiResponse = await PushAPI.payloads.sendNotification({
    signer: signerChannel, // Needs to resolve to channel address
    type: 1, // broadcast
    identityType: 2, // direct payload
    notification: {
      title: `notification TITLE:`,
      body: `notification BODY`,
    },
    payload: {
      title: `payload title`,
      body: `sample msg body`,
      cta: '',
      img: '',
    },
    channel: `eip155:11155111:${channelAddress}`, // your channel address
    env: env as ENV,
  });

  console.log('PushAPI.payloads.sendNotification | Response - 204 OK');
  if (!silent) {
    console.log(apiResponse);
  }
}

// Push Notification - Get Subscribers list from channels (DEPRECATED)
async function PushAPI_channels_getSubscribers(silent = !showAPIResponse) {
  const subscribers = await PushAPI.channels._getSubscribers({
    channel: `eip155:11155111:${channelAddress}`, // channel address in CAIP
    env: env as ENV,
  });

  console.log('PushAPI.channels._getSubscribers | Response - 200 OK');
  if (!silent) {
    console.log(subscribers);
  }
}

// Push Notification - Socket Connection
async function PushSDKSocket(silent = !showAPIResponse) {
  const pushSDKSocket = createSocketConnection({
    user: `eip155:11155111:${signerAddress}`, // CAIP, see below
    socketOptions: { autoConnect: false },
    env: env as ENV,
  });

  if (!pushSDKSocket) {
    throw new Error('PushSDKSocket | Socket Connection Failed');
  }

  pushSDKSocket.connect();

  pushSDKSocket.on(EVENTS.CONNECT, async () => {
    console.log('Socket Connected - will disconnect after 4 seconds');

    // send a notification to see the result
    await PushAPI_payloads_sendNotification__direct_payload_single_recipient(
      true
    );
  });

  pushSDKSocket.on(EVENTS.DISCONNECT, () => {
    console.log('Socket Disconnected');
  });

  pushSDKSocket.on(EVENTS.USER_FEEDS, (feedItem) => {
    // feedItem is the notification data when that notification was received
    console.log('Incoming Feed from Socket');
    if (!silent) {
      console.log(feedItem);
    }

    // disconnect socket after this, not to be done in real implementations
    pushSDKSocket.disconnect();
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  await delay(4000);
}
