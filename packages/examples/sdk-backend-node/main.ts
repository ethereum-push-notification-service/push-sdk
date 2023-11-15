import { runUserCases } from './user';
import { runNotificationUseCases } from './notification';
import { runChatUseCases } from './chat';
import { runVideoUseCases } from './video';
import { runSpaceUseCases } from './space';

import { config } from './config';
import { ENV } from './types';
import { exit } from 'process';

// CONFIGS
const { env } = config;

// Use Cases
const start = async (): Promise<void> => {
  console.log(`${returnHeadingLog()}`);
  console.log(`${returnENVLog()}`);

  await runUserCases();
  await runNotificationUseCases();
  await runChatUseCases();
  await runVideoUseCases();
  await runSpaceUseCases();
  exit(0);
};

start();

// -----------
// -----------
// FUNCTION TO EMIT HEADER
// -----------
// -----------
function returnHeadingLog() {
  const headingLog = `

░██████╗██████╗░██╗░░██╗   ███████╗██╗░░░██╗███╗░░██╗░█████╗░████████╗██╗░█████╗░███╗░░██╗░█████╗░██╗░░░░░██╗████████╗██╗░░░██╗
██╔════╝██╔══██╗██║░██╔╝   ██╔════╝██║░░░██║████╗░██║██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║██╔══██╗██║░░░░░██║╚══██╔══╝╚██╗░██╔╝
╚█████╗░██║░░██║█████═╝░   █████╗░░██║░░░██║██╔██╗██║██║░░╚═╝░░░██║░░░██║██║░░██║██╔██╗██║███████║██║░░░░░██║░░░██║░░░░╚████╔╝░
░╚═══██╗██║░░██║██╔═██╗░   ██╔══╝░░██║░░░██║██║╚████║██║░░██╗░░░██║░░░██║██║░░██║██║╚████║██╔══██║██║░░░░░██║░░░██║░░░░░╚██╔╝░░
██████╔╝██████╔╝██║░╚██╗   ██║░░░░░╚██████╔╝██║░╚███║╚█████╔╝░░░██║░░░██║╚█████╔╝██║░╚███║██║░░██║███████╗██║░░░██║░░░░░░██║░░░
╚═════╝░╚═════╝░╚═╝░░╚═╝   ╚═╝░░░░░░╚═════╝░╚═╝░░╚══╝░╚════╝░░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝╚═╝░░╚═╝╚══════╝╚═╝░░░╚═╝░░░░░░╚═╝░░░
  `;
  return headingLog;
}

function returnENVLog() {
  let environmentLog = `

███████╗███╗░░██╗██╗░░░██╗  ░░░░░░   ░██████╗████████╗░█████╗░░██████╗░██╗███╗░░██╗░██████╗░
██╔════╝████╗░██║██║░░░██║  ░░░░░░   ██╔════╝╚══██╔══╝██╔══██╗██╔════╝░██║████╗░██║██╔════╝░
█████╗░░██╔██╗██║╚██╗░██╔╝  █████╗   ╚█████╗░░░░██║░░░███████║██║░░██╗░██║██╔██╗██║██║░░██╗░
██╔══╝░░██║╚████║░╚████╔╝░  ╚════╝   ░╚═══██╗░░░██║░░░██╔══██║██║░░╚██╗██║██║╚████║██║░░╚██╗
███████╗██║░╚███║░░╚██╔╝░░  ░░░░░░   ██████╔╝░░░██║░░░██║░░██║╚██████╔╝██║██║░╚███║╚██████╔╝
╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ░░░░░░   ╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝░╚═════╝░╚═╝╚═╝░░╚══╝░╚═════╝░
  `;

  if (env === ENV.PROD) {
    environmentLog = `
███████╗███╗░░██╗██╗░░░██╗  ░░░░░░  ██████╗░██████╗░░█████╗░██████╗░
██╔════╝████╗░██║██║░░░██║  ░░░░░░  ██╔══██╗██╔══██╗██╔══██╗██╔══██╗
█████╗░░██╔██╗██║╚██╗░██╔╝  █████╗  ██████╔╝██████╔╝██║░░██║██║░░██║
██╔══╝░░██║╚████║░╚████╔╝░  ╚════╝  ██╔═══╝░██╔══██╗██║░░██║██║░░██║
███████╗██║░╚███║░░╚██╔╝░░  ░░░░░░  ██║░░░░░██║░░██║╚█████╔╝██████╔╝
╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ░░░░░░  ╚═╝░░░░░╚═╝░░╚═╝░╚════╝░╚═════╝░
    `;
  } else if (env === ENV.DEV) {
    environmentLog = `
███████╗███╗░░██╗██╗░░░██╗  ░░░░░░  ██████╗░███████╗██╗░░░██╗
██╔════╝████╗░██║██║░░░██║  ░░░░░░  ██╔══██╗██╔════╝██║░░░██║
█████╗░░██╔██╗██║╚██╗░██╔╝  █████╗  ██║░░██║█████╗░░╚██╗░██╔╝
██╔══╝░░██║╚████║░╚████╔╝░  ╚════╝  ██║░░██║██╔══╝░░░╚████╔╝░
███████╗██║░╚███║░░╚██╔╝░░  ░░░░░░  ██████╔╝███████╗░░╚██╔╝░░
╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ░░░░░░  ╚═════╝░╚══════╝░░░╚═╝░░░
    `;
  } else if (env === ENV.LOCAL) {
    environmentLog = `
███████╗███╗░░██╗██╗░░░██╗  ░░░░░░  ██╗░░░░░░█████╗░░█████╗░░█████╗░██╗░░░░░
██╔════╝████╗░██║██║░░░██║  ░░░░░░  ██║░░░░░██╔══██╗██╔══██╗██╔══██╗██║░░░░░
█████╗░░██╔██╗██║╚██╗░██╔╝  █████╗  ██║░░░░░██║░░██║██║░░╚═╝███████║██║░░░░░
██╔══╝░░██║╚████║░╚████╔╝░  ╚════╝  ██║░░░░░██║░░██║██║░░██╗██╔══██║██║░░░░░
███████╗██║░╚███║░░╚██╔╝░░  ░░░░░░  ███████╗╚█████╔╝╚█████╔╝██║░░██║███████╗
╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ░░░░░░  ╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚══════╝
    `;
  }

  return environmentLog;
}
