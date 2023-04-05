export enum ENV {
  PROD = 'prod',
  STAGING ='staging',
  DEV ='dev'
};

export const EVENTS = {
  // Websocket
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Notification
  USER_FEEDS: 'userFeeds',
  USER_SPAM_FEEDS: 'userSpamFeeds',

  // Chat
  CHAT_RECEIVED_MESSAGE: 'CHATS',
  CHAT_GROUPS: 'CHAT_GROUPS'

};