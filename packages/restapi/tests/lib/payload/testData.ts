import { ISendNotificationInputOptions } from '../../../src/lib/types';
import { NOTIFICATION_TYPE } from '../../../src/lib/payloads';

export const TEST_PAYLOAD = {
  data: {
    acta: 'https://polygonscan.com/tx/0xb7a5b72c7476e3911d4d3688e160a977d89be5109cea8bb76a6402bdb9158e24',
    aimg: '',
    amsg: 'New [s: Trade Confirmation] on Quickswap. 80.77 [d: USDC] has been swapped for 100.00 [t: WMATIC] at a price of 1 [t: WMATIC] = 0.81 [d: USDC][timestamp: 1705579349]',
    asub: 'New Swap on Quickswap',
    type: '3'
  },
  recipients: '0x94051eE59A831E247590cE779DF065dd77EF5d0a',
  notification: {
    body: 'A New Swap has been made on Quickswap.',
    title: 'New Swap on Quickswap'
  }
};

export const TEST_NOCE = 'abcdEFG';

export const TARGETED_RECIPIENT = '0x69e666767Ba3a661369e1e2F572EdE7ADC926029';
export const CHANNEL =
  'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681';

export const SUBSET_RECIPIENT = [
  '0xD8634C39BBFd4033c0d3289C4515275102423681',
  '0x69e666767Ba3a661369e1e2F572EdE7ADC926029'
];

export const TEST_ENC_RAW_PAYLOAD: ISendNotificationInputOptions = {
  senderType: 0,
  signer: '',
  type: NOTIFICATION_TYPE.TARGETTED,
  notification: {
    title: 'hey123',
    body: 'hey123'
  },
  payload: {
    sectype: 'PGPV1',
    title: 'hey123',
    body: 'hey123',
    cta: 'https://google.com',
    img: 'test-image.png',
    hidden: false,
    etime: 10000
  },
  channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681',
  identityType: 2
};

export const TEST_ENC_LIT_RAW_PAYLOAD: ISendNotificationInputOptions = {
  senderType: 0,
  signer: '',
  type: NOTIFICATION_TYPE.TARGETTED,
  notification: {
    title: 'hey',
    body: 'hey'
  },
  payload: {
    sectype: 'LITV1',
    title: 'hey',
    body: 'hey',
    cta: 'https://google.com',
    img: 'test-image.png',
    hidden: false,
    etime: 10000
  },
  channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681',
  identityType: 2
};

export const TEST_ENC_SUBSET_RAW_PAYLOAD: ISendNotificationInputOptions = {
  senderType: 0,
  signer: '',
  type: NOTIFICATION_TYPE.SUBSET,
  notification: {
    title: 'hey subset users',
    body: 'hey subset users'
  },
  payload: {
    sectype: 'PGPV1',
    title: 'hey subset users',
    body: 'hey subset users',
    cta: 'https://google.com',
    img: 'test-image.png',
    hidden: false,
    etime: 10000
  },
  channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681',
  identityType: 2
};

export const TEST_LIT_ENC_SUBSET_RAW_PAYLOAD: ISendNotificationInputOptions = {
  senderType: 0,
  signer: '',
  type: NOTIFICATION_TYPE.SUBSET,
  notification: {
    title: 'hey2',
    body: 'hey2'
  },
  payload: {
    sectype: 'LITV1',
    title: 'hey',
    body: 'hey',
    cta: 'https://google.com',
    img: 'test-image.png',
    hidden: false,
    etime: 10000
  },
  channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681',
  identityType: 2
};


export const TEST_ENC_BROADCAST_RAW_PAYLOAD: ISendNotificationInputOptions = {
  senderType: 0,
  signer: '',
  type: NOTIFICATION_TYPE.BROADCAST,
  notification: {
    title: 'hey',
    body: 'hey'
  },
  payload: {
    sectype: 'PGPV1',
    title: 'hey',
    body: 'hey',
    cta: 'https://google.com',
    img: 'test-image.png',
    hidden: false,
    etime: 10000
  },
  channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681',
  identityType: 2
};

export const TEST_ENC_LIT_BROADCAST_RAW_PAYLOAD: ISendNotificationInputOptions = {
  senderType: 0,
  signer: '',
  type: NOTIFICATION_TYPE.BROADCAST,
  notification: {
    title: 'hey4',
    body: 'hey4'
  },
  payload: {
    sectype: 'LITV1',
    title: 'hey',
    body: 'hey',
    cta: 'https://google.com',
    img: 'test-image.png',
    hidden: false,
    etime: 10000
  },
  channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681',
  identityType: 2
};

export const TEST_RAW_PAYLOAD: ISendNotificationInputOptions = {
  senderType: 0,
  signer: '',
  type: NOTIFICATION_TYPE.TARGETTED,
  notification: {
    title: 'hey',
    body: 'hey'
  },
  payload: {
    sectype: null,
    title: 'hey',
    body: 'hey',
    cta: 'https://google.com',
    img: 'test-image.png',
    hidden: false,
    etime: 10000
  },
  channel: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681',
  identityType: 2
};

export const TEST_PGP_ENCRYPTED_FEED = {
  cta: 'U2FsdGVkX19I6FQ5rIyjO9ZLakhkmIe1bJLRkB38apuOQaH54a2015aO7/0le8wO',
  title: 'U2FsdGVkX1/8+7EyDo2GlRhGUY6M4Y/D/ZzEKDOC/jQ=',
  message: 'U2FsdGVkX1+PXdFJia54450Hvt5ERyypXaje33jvh0U=',
  icon: 'https://gateway.ipfs.io/ipfs/bafybeib76bmkscu6efwawi2tkltdgthwrpny2ok7lur7nltffgydiq7ruy/QmVaY4HQaorrMhKo1sHk7FM1B8Xi1JnT3DvJbG9Xv7VeLZ',
  url: 'https://google.com',
  sid: '21',
  app: 'Updated Name',
  image: 'U2FsdGVkX186wYlg3QbHuDP0twQnH/x31SO0wiPzsm8=',
  blockchain: 'ETH_TEST_SEPOLIA',
  notification: {
    body: 'U2FsdGVkX1/o822n472meDdT+BB/P+ao6HjSGrfMwlA=',
    title: 'Updated Name has sent you a secret message!'
  },
  secret: 'PGPV1:-----BEGIN PGP MESSAGE-----\n' +
    '\n' +
    'wcBMAzEMrI2kRcMnAQf/dKg7wgescOy7nIu3ymNxf0FpNnHsUc90jwVGaOjW\n' +
    'mZTGS/c4gFQ8hJKA6GMViDVsclld4Dph8BZQVXjzNb0JGq1dnTC6VWSVkhcm\n' +
    'o9qsrpblcJkCTEHfttHAI1/soLMl7A64OQKqM/CnipQL2QYm2M2MYy8+U0Tk\n' +
    'Yo81FIBINlJMsMBw8p713XvCR2t6rx/hoYHIZyWRcsoIUj9fr1ac2q2QUHqs\n' +
    'gppHxZIblVAB2VYmYiArG91Hms2lIjwADhYo3E1WNhTG7RBJkJDAJRSEEYCB\n' +
    'Z6Hc2oEm3p5xfmEN8KEbK/qNQo08KWUL4uh2V/nlDg+kkPydEG09L0ZjE4Hn\n' +
    'UtI7ATClmJN7Vt6V81CmcH58zToKidguomExfkzjEHzsF5qh6VSTXGCwosZu\n' +
    'Ht1wuJtDiZY6LArVKC1sEdQ=\n' +
    '=GmBl\n' +
    '-----END PGP MESSAGE-----\n'
}

export const TEST_PUBLIC_KEY = '0x042a31efbcf9fe374fb1b1afdbadb6b266ddec97418c69dd81500f352f178f4b7e934ae2750026eef206d3a5d43d866b9a46e68b1f6b4f32167c992955fc890748'
export const TEST_PRIVATE_KEY = '0x11c3093f770006c88df88f44f39d99bc89697ad72c3796556ca8a1c0675416a0'
export const TEST_PK_ENC_RECIPIENT = '0x5913760160d245d0C9A05a8a956012694281bEE3'
export const TEST_RECIPIENT_PK= ''

export const TEST_LIT_ENCRYPTED_FEED =   {
  "payload_id": 5,
  "channel": "0xD8634C39BBFd4033c0d3289C4515275102423681",
  "epoch": "2024-02-05T02:56:03.000Z",
  "payload": {
    "data": {
      "app": "Updated Name",
      "sid": "5",
      "url": "https://google.com",
      "acta": "U2FsdGVkX1+rFDVZ6IbtxPEV3Kz3JMjuhlfL53NzNBHgsEe5xPJFFmtNHJjs8Ki8",
      "aimg": "U2FsdGVkX18WacX3Z5odQpmfpOsYSnKtHRegaHTI0/k=",
      "amsg": "U2FsdGVkX1/PlM/YLlMSDct5XNoWXVN5z+cE5It97Ng=",
      "asub": "U2FsdGVkX18cNTghnYQLcVdMSMhsrtpqu0WvDFetq20=",
      "icon": "https://gateway.ipfs.io/ipfs/QmTBk4mB2HTKACRusaJpKLsVibopesZo9YowXZ7zao9paZ",
      "type": 1,
      "epoch": "1707121563.486",
      "etime": "10000",
      "hidden": "0",
      "silent": "0",
      "sectype": "LITV1",
      "additionalMeta": null,
      "secret": "LITV1:{\"ciphertext\":\"rvm2GYg4gmIAbUgXl8ryq5Yxa0nC+yrkZ78LH0WrO0G7+IL/Ct4oKfj/aT+RHxFDlSFnf0vsWhX+GfSZg5r1XGUr6RxD9TSL8497ccP2jjAgknqaYUgBWMuhLfQqejQlWH3of4RfoKfe13zubSFg6aQD\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
    },
    "recipients": {
      "0x1d70b3686f68b449574c234b8d21102a55e3c6f6": {
        "secret": "LITV1:{\"ciphertext\":\"q9tK07l+cBB7doggMJ1vMEMKdq8H4xHW4nK6NvPblwmwML7blE5/tWs27SFijBK4x/XaHKRhHrvoWbca0/mx53yGd+S3cwzNLJG1ergVxhEgID6Or2ENJtUsPsKS3HfvBi0r1Wb/GaVT7H9Rs65YhC8D\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0x2d3ec4b00e1ed43a5b83c68379a5d4316b7627d4": {
        "secret": "LITV1:{\"ciphertext\":\"l3XbKffR+ZDeoE0iWmspj7yeY95EJX7wklMTP012KHY8zrMd8mDW8BUwPCKb9Dv4VG2LJOlPoSwwJLQh9+cGGKvBEdml4j6VJSwrLQdRaqQg+i7mcUp9F8wxfYH3jPEyIs03rkLXkh+xpT8WVBRTYOoD\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0x555adea9bd94ab65970ada6586f59289a7e510eb": {
        "secret": "LITV1:{\"ciphertext\":\"jxoRZ8pwrLukBCvhpFmx8DrXnKDHxnH9XxjN2rxRwzqmMSMcW1bSVkGHnInJGY0ylSzUGwX2OG4tPvdvQPdJKtd0fF5iQf9Vu18BmQhemOkgfNtrEPv/T3FR6zSYnMjCYRStOgvX1KSTe8br9GJvWGwD\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0x564ff5e1ef5178505e1a9370de60d36c84ff2afd": {
        "secret": "LITV1:{\"ciphertext\":\"lK3LXRRfvjB9NQXxdA2ioLHCXmBbOznBX/iojv49ONeEShZMVcyESsAf5oBeJTCZFTdIfDQcSNaQVHVm09cbWBsdPKPAZCT+qNjSW83xgv0g6VLfueLnq37vYs2BGFQsoeaFN8WvX1xf0lTPu6moqC4D\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0x57c1d4dbfbc9f8cb77709493cc43eaa3cd505432": {
        "secret": "LITV1:{\"ciphertext\":\"igCLGDdgn94De67KaP3TFeVraExN2G5qPnzjyWBfZgMRIAhlLqYCET9AF0hmL9c5gJuXCzPHf1UPZ1Jdk7rBal+GRQYkg+HDmaeKgCbNi6Ugz/GE+oe7k/mFNfIalMTQXiBRtYCBLAwL+vp5xh4I/akD\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0x5ac9e6205eaca2bbba6ef716fd9aabd76326eeee": {
        "secret": "LITV1:{\"ciphertext\":\"rzOZwOJltRGAqm3LcdXTkaLBI8DcVN8R/CiSCg36AS8LACX6x4QFujEtWvj14wrg3yIimz7TnFYFowFkQdiRqdXm7UfILy50iEYltZwf/Fgg2CtzBIiYyMnsfZIauFwoKT5Q4vGG8orbLr+IQM3L6zYD\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0x5d133a54e7eae204867cf77a936537117a375c2a": {
        "secret": "LITV1:{\"ciphertext\":\"i3EDj/+KYldI3RBoDUOr+X3WP1iDBb04VWCrudyN+vldEXHq5lsHBlxfj2AOCgoB02KDsDoEbcQkvUCuh09kUJaOxfeKp+h+K6u7YSzt74sgRkGBe3oUD4jTF7VATSpS8zBmPJVK1ShAmGCFNNU51n0D\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0x69e666767ba3a661369e1e2f572ede7adc926029": {
        "secret": "LITV1:{\"ciphertext\":\"rvm2GYg4gmIAbUgXl8ryq5Yxa0nC+yrkZ78LH0WrO0G7+IL/Ct4oKfj/aT+RHxFDlSFnf0vsWhX+GfSZg5r1XGUr6RxD9TSL8497ccP2jjAgknqaYUgBWMuhLfQqejQlWH3of4RfoKfe13zubSFg6aQD\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0xd8634c39bbfd4033c0d3289c4515275102423681": {
        "secret": "LITV1:{\"ciphertext\":\"rwWJuzpB0p8ZpbM9Cg/pHApsnlZehSoeODunty31s0pflayLtlmNG1bMcFywXLQCF4YA7d4dIegEsTDZnkChltfoNcBKQnXGG8sbZe/pTF0gfAlUr+zLUTadvpY+akiF9BTKMw+QSaC2opQziDpK3yID\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      },
      "0xede1bc3d6c0cd15244101dbc60a21839d58db27a": {
        "secret": "LITV1:{\"ciphertext\":\"ra+Xx5oU8V1UktxUPwAV8iP5AO1SUv+eMifddm+Qx5+FbDe4movhIvP7zQJQrwi9wqCvrhJ09oULql0KKyh9VOaH+N2KiU76J9hjgraAzlcgq8QLKHWu2USkbhuElNGQuJ/Fs2Qc5MB6ueWChVTVJ8UD\",\"dataToEncryptHash\":\"05416300865f6ffa0f735123a98625a5bebce63c31cbc9a7baf06424992ad944\"}"
      }
    },
    "notification": {
      "body": "U2FsdGVkX1+95pa9h96TPsU8fxaxHwp9jO4f0MTkYUM=",
      "title": "Updated Name has sent you a secret message!"
    },
    "verificationProof": "eip712v2:0x7822f806371b5087cd8fe676d6ef14dba862b0d19a312691665fa6de75855bd02ce10afad9fc08ec335d276bc6606bd85c1e4378665a1ded234ae4c33f8248991c::uid::8d2e6694-45e7-44ea-9baa-d46ece673b3b"
  },
  "source": "ETH_TEST_SEPOLIA",
  "etime": "1969-12-31T21:16:40.000Z"
}