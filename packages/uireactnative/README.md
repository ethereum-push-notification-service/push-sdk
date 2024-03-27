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

- [Push React Native UI SDK](#push-react-native-ui-sdk)
- [How to use in your app?](#how-to-use-in-your-app)

  - [Install the SDK](#install-the-sdk)
  - [Start using the Push SDK in your app](#start-using-the-push-sdk-in-your-app)

- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

# Push React Native UI SDK

<p>
Push React Native UI SDK provides an abstraction layer to integrate Push protocol features on your react native frontend.
This SDK is a react-native based package that helps developers to :

- Build PUSH features into their DApps
  - Notifications

without having to write a lot of boilerplate code. All the heavy lifting is done by the SDK, so that you the developer can focus on building features and bootstrap a DApp with PUSH features in no time!

</p>
</div>

## How to use in your app?

#### Install the SDK

```bash
yarn add @pushprotocol/uireactnative
```

or

```bash
npm install @pushprotocol/uireactnative
```

#### Start using the Push SDK in your app

```jsx
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { PushAPI, CONSTANTS } from '@pushprotocol/react-native-sdk';
import { NotificationItem } from '@pushprotocol/uireactnative';
import { ethers } from 'ethers';

export const App = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    (async () => {
      const signer = new ethers.Wallet('07da77f7471e5cf046ea3793421cbce90fd42a4cfcf520046a490ca1a9b636e0');
      const account = `eip155:${signer.address}`;

      const alice = await PushAPI.initialize(signer, {
        account,
        env: CONSTANTS.ENV.DEV,
      });

      const spam = await alice.notification.list('SPAM', {
        limit: 10,
        page: 1,
      });
      setNotifications(spam);
    })();
  }, []);

  return (
    <View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notificationTitle={item.title}
            notificationBody={item.message}
            cta={item.cta}
            app={item.app}
            icon={item.icon}
            image={item.image}
            url={item.url}
            theme={item.theme}
            chainName={item.chainName}
            customTheme={{
              fontSize: {
                notificationTitleText: 16,
              },
            }}
          />
        )}
        keyExtractor={(item) => item.sid}
      />
    </View>
  );
};
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

Read how you can contribute <a href="https://github.com/push-protocol/push-sdk/blob/main/CONTRIBUTING.md">HERE</a>

Not sure where to start? Join our discord and we will help you get started!

<a href="https://discord.gg/pushprotocol" title="Join Our Community"><img src="https://www.freepnglogos.com/uploads/discord-logo-png/playerunknown-battlegrounds-bgparty-15.png" width="200" alt="Discord" /></a>

## License

Check out our License <a href='https://github.com/push-protocol/push-sdk/blob/main/license-v1.md'>HERE </a>
