<h1 align="center">
    <a href="https://push.org/#gh-light-mode-only">
    <img width='20%' height='10%' 
src="https://res.cloudinary.com/drdjegqln/image/upload/v1686227557/Push-Logo-Standard-Dark_xap7z5.png">
    </a>
    <a href="https://push.org/#gh-dark-mode-only">
    <img width='20%' height='10%' 
src="https://res.cloudinary.com/drdjegqln/image/upload/v1686227558/Push-Logo-Standard-White_dlvapc.png">
    </a>
</h1>

<p align="center">
  <i align="center">Push Protocol is a web3 communication network, enabling cross-chain notifications, messaging, video, and NFT chat for dapps, wallets, and services.🚀</i>
</p>

<h4 align="center">

  <a href="https://discord.com/invite/pushprotocol">
    <img src="https://img.shields.io/badge/discord-7289da.svg?style=flat-square" alt="discord">
  </a>
  <a href="https://twitter.com/pushprotocol">
    <img src="https://img.shields.io/badge/twitter-18a1d6.svg?style=flat-square" alt="twitter">
  </a>
  <a href="https://www.youtube.com/@pushprotocol">
    <img src="https://img.shields.io/badge/youtube-d95652.svg?style=flat-square&" alt="youtube">
  </a>
</h4>
</h1>

# Index

- [Push React Native SDK](#push-react-native-sdk)
- [How to use in your app?](#how-to-use-in-your-app)

  - [Install the SDK](#install-the-sdk)
  - [Install the peer dependencies](#install-the-peer-dependencies)
  - [Nodeify the crypto packages](#nodeify-the-crypto-packages)
  - [Add the WebViewCrypto component in your app root](#add-the-webviewcrypto-component-in-your-app-root)
  - [Start using the Push SDK in your app](#start-using-the-push-sdk-in-your-app)

- [Other Features](#other-features)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

# Push React Native SDK

<p>
Push SDK provides an abstraction layer to integrate Push protocol features with your Frontend as well as Backend.
This SDK is a react-native based repo of packages that helps developers to :

- Build PUSH features into their DApps
  - Notifications
  - Chat
  - Group Chat

without having to write a lot of boilerplate code. All the heavy lifting is done by the SDK, so that you the developer can focus on building features and bootstrap a DApp with PUSH features in no time!

</p>
</div>

## How to use in your app?

#### Install the SDK

```bash
yarn add @pushprotocol/react-native-sdk
```

or

```bash
npm install @pushprotocol/react-native-sdk
```

#### Install the peer dependencies

```bash
yarn add react-native-randombytes react-native-webview react-native-webview-crypto react-native-fast-openpgp react-native-get-random-values text-encoding crypto
```

or

```bash
npm install react-native-randombytes react-native-webview react-native-webview-crypto react-native-fast-openpgp react-native-get-random-values text-encoding crypto
```

#### Nodeify the crypto packages

Add postinstall script in your `package.json` file if `node_modules` are not nodeified already

```bash
"postinstall": "node_modules/.bin/rn-nodeify --install crypto,assert,url,stream,events,http,https,os,url,net,fs --hack"
```

#### Add the WebViewCrypto component in your app root

```jsx
import WebViewCrypto from 'react-native-webview-crypto';

return (
  <>
    <WebViewCrypto />
    <App />
  </>
);
```

#### Start using the Push SDK in your app

For the complete list of features and how to use them, please refer to the [restapi documentation](https://github.com/push-protocol/push-sdk/blob/main/packages/restapi/README.md#sdk-features).

```jsx
import { PushAPI, CONSTANTS } from '@pushprotocol/react-native-sdk';
import { ethers } from 'ethers';

const signer = new ethers.Wallet(
  '07da77f7471e5cf046ea3793421cbce90fd42a4cfcf520046a490ca1a9b636e0'
);
const account = `eip155:${signer.address}`;

const alice = await PushAPI.initialize(signer, {
  account,
  env: CONSTANTS.ENV.DEV,
});

const spam = await alice.notification.list('SPAM', {
  limit: 10,
  page: 1,
});

```

## Other Features

All the remaining features of the `restapi` SDK are available in a similar manner to the `restapi` package. You can read more about them <a href="https://github.com/push-protocol/push-sdk/blob/main/packages/restapi/README.md">HERE</a>


console.log('SPAM NOTIFICATIONS', spam);
```

## Resources

- **[Website](https://push.org)** To checkout our Product.
- **[Docs](https://docs.push.org/developers/)** For comprehensive documentation.
- **[Blog](https://medium.com/push-protocol)** To learn more about our partners, new launches, etc.
- **[Discord](discord.gg/pushprotocol)** for support and discussions with the community and the team.
- **[GitHub](https://github.com/push-protocol)** for source code, project board, issues, and pull requests.
- **[Twitter](https://twitter.com/pushprotocol)** for the latest updates on the product and published blogs.

## Contributing

Push Protocol is an open source Project. We firmly believe in a completely transparent development process and value any contributions. We would love to have you as a member of the community, whether you are assisting us in bug fixes, suggesting new features, enhancing our documentation, or simply spreading the word.

- Bug Report: Please create a bug report if you encounter any errors or problems while utilising the Push Protocol.
- Feature Request: Please submit a feature request if you have an idea or discover a capability that would make development simpler and more reliable.
- Documentation Request: If you're reading the Push documentation and believe that we're missing something, please create a docs request.


Read how you can contribute <a href="https://github.com/push-protocol/push-sdk/blob/main/contributing.md">HERE</a>


Not sure where to start? Join our discord and we will help you get started!

<a href="https://discord.gg/pushprotocol" title="Join Our Community"><img src="https://www.freepnglogos.com/uploads/discord-logo-png/playerunknown-battlegrounds-bgparty-15.png" width="200" alt="Discord" /></a>

## License

Check out our License <a href='https://github.com/push-protocol/push-sdk/blob/main/license-v1.md'>HERE </a>
