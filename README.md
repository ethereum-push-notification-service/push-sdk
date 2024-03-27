<h1 align="center">
    <a href="https://push.org/#gh-light-mode-only">
    <img width='20%' height='10%' src="https://res.cloudinary.com/drdjegqln/image/upload/v1686227557/Push-Logo-Standard-Dark_xap7z5.png">
    </a>
    <a href="https://push.org/#gh-dark-mode-only">
    <img width='20%' height='10%' src="https://res.cloudinary.com/drdjegqln/image/upload/v1686227558/Push-Logo-Standard-White_dlvapc.png">
    </a>
</h1>

<p align="center">
  <i align="center">Push Protocol is a web3 communication network, enabling cross-chain notifications and messaging for dapps, wallets, and services.🚀</i>
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

<p align="center">
    <img src="https://res.cloudinary.com/drdjegqln/image/upload/v1686230764/1500x500_bhmpkc.jpg" alt="dashboard"/>
</p>


## Introduction
#### What is Push Protocol?

Push Protocol, previously known as EPNS, is a Web3 communication protocol that enables any dApps, smart contracts, backends, or protocols to communicate both on-chain and off-chain via user wallet addresses in an open, gasless, multichain, and platform-agnostic fashion.

#### What We Do

Being an open communication middleware, Push is building a suite of products to enable notifications, chats, streaming, and more. We currently have two major products, Push Notifications and Push Chat.

<details open>
<summary>
 Features
</summary>
  <br>
  
  <p align="center">
    <img width="49%" src="https://res.cloudinary.com/drdjegqln/image/upload/v1686231190/push-notifications_tkjhss.png" alt="apis"/>
&nbsp;
    <img width="49%" src="https://res.cloudinary.com/drdjegqln/image/upload/v1686231185/W2W_20Chat_eurjgu.png" alt="data-models"/>
</p>


    
<p align="center">
    <img width="49%" src="https://res.cloudinary.com/drdjegqln/image/upload/v1686231164/Untitled-2_fedru3.png" alt="own-your-code"/>
&nbsp;
    <img width="49%" src="https://res.cloudinary.com/drdjegqln/image/upload/v1686231177/Untitled_vhvrfc.png" alt="customize-code"/>
</p>
   
  <p align="center">
    <img width="49%" src="https://res.cloudinary.com/drdjegqln/image/upload/v1686231162/1_LbhU9-qGnE8QPxWBQgNqQQ_xzkmpp.webp" alt="own-your-code"/>
&nbsp;
 
</p>
</details>

<br>
<br>

## PUSH-SDK

#### Push SDK provides an abstraction layer to integrate Push protocol features with your Frontend as well as Backend

PUSH SDK is a Javascript based Monorepo of packages that helps developers to 
- build PUSH features into their DApps
  - Notifications
  - Chat
  - Group Chat
  - Push NFT Chat
  - Video Calls
- get access to PUSH Push Nodes APIs
- render PUSH Notifications UI

without having to write a lot of boilerplate code. All the heavy lifting is done by the SDK, so that you the developer can focus on building features and bootstrap a DApp with PUSH features in no time!

The SDK provides a suite of solutions for different problems. It is written in Typescript and supports React, React Native, Plain JS, Node JS based platforms. (We are adding support for more!)

*It is also built on top of standard Web3 packages like `ethers`, `@web3-react`*

## Development
### Packages available

Click on the packages to view more details.

- [@pushprotocol/restapi](./packages/restapi/README.md)
- [@pushprotocol/uiweb](./packages/uiweb/README.md)
- [@pushprotocol/socket](./packages/socket/README.md)
- [@pushprotocol/uiembed](./packages/uiembed/README.md)
- [@pushprotocol/reactnative](./packages/reactnative/README.md)


<details >
<summary>
Sample Usage
</summary>

*How to use a package from the SDK?*

Let's take `@pushprotocol/restapi` as an example.

Open a teminal and enter
```bash
mkdir sdk-quickstart
cd sdk-quickstart

# at sdk-quickstart, hit enter for all if no change from default intended
yarn init 

# or NPM
npm init
```

If you want to use ES6 Modules syntax then inside `package.json` set “type” to “module”.

```bash
# install the sdk "restapi" package & its peer dependencies in your app
yarn add @pushprotocol/restapi ethers

# or NPM
npm install @pushprotocol/restapi ethers
```

```bash
touch main.js
```

For *CommonJS* Syntax
```typescript
// import in main.js
const PushAPI = require("@pushprotocol/restapi");
```

**OR**

For *ES6 modules* Syntax
```typescript
// import in main.js
import * as PushAPI from "@pushprotocol/restapi";
```

```typescript
// use a feature from restapi package,
// here "getFeeds" gets all the notifications for the user address provided
const main = async() => {
  const notifications = await PushAPI.user.getFeeds({
    user: 'eip155:11155111:0xD8634C39BBFd4033c0d3289C4515275102423681', // user address in CAIP
    env: 'staging'
  });

  // log the notifications 
  console.log('notifications: \n\n', notifications);
}

main();
```

Then to run this code open terminal and type

```bash
node main
```
</details>
<br>

## Resources
- **[Website](https://push.org)** To checkout our Product.
- **[Docs](https://docs.push.org/developers/)** For comprehensive documentation.
- **[Blog](https://medium.com/push-protocol)** To learn more about our partners, new launches, etc.
- **[Discord](https://discord.com/invite/pushprotocol)** for support and discussions with the community and the team.
- **[GitHub](https://github.com/push-protocol)** for source code, project board, issues, and pull requests.
- **[Twitter](https://twitter.com/pushprotocol)** for the latest updates on the product and published blogs.


## Contributing

Push Protocol is an open source Project. We firmly believe in a completely transparent development process and value any contributions. We would love to have you as a member of the community, whether you are assisting us in bug fixes, suggesting new features, enhancing our documentation, or simply spreading the word. 

- Bug Report: Please create a bug report if you encounter any errors or problems while utilising the Push Protocol.
- Feature Request: Please submit a feature request if you have an idea or discover a capability that would make development simpler and more reliable.
- Documentation Request: If you're reading the Push documentation and believe that we're missing something, please create a docs request.


Read how you can contribute <a href="https://github.com/push-protocol/push-sdk/blob/main/CONTRIBUTING.md
">HERE</a>

Not sure where to start? Join our discord and we will help you get started!


<a href="https://discord.com/invite/pushprotocol" title="Join Our Community"><img src="https://www.freepnglogos.com/uploads/discord-logo-png/playerunknown-battlegrounds-bgparty-15.png" width="200" alt="Discord" /></a>

## License
Check out our License <a href='https://github.com/push-protocol/push-sdk/blob/main/license-v1.md'>HERE </a>


