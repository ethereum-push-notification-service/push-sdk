import { runNotificaitonsUseCases } from './notification';
import { runChatUseCases, runNFTChatUseCases } from './chat';
import { runVideoUseCases } from './video';
import { config } from './config';
import { ENV } from './types';

// CONFIGS
const { env } = config;

// Use Cases
const start = async (): Promise<void> => {
  console.log(`${returnHeadingLog()}`);
  console.log(`${returnENVLog()}`);

  await runNotificaitonsUseCases();
  await runChatUseCases();
  await runNFTChatUseCases();
  await runVideoUseCases();
};

start();

// -----------
// -----------
// FUNCTION TO EMIT HEADER
// -----------
// -----------
function returnHeadingLog() {
  const headingLog = `
    ███████ ██████  ██   ██     ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██  █████  ██      ██ ████████ ██    ██
    ██      ██   ██ ██  ██      ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██   ██ ██      ██    ██     ██  ██
    ███████ ██   ██ █████       █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████ ██      ██    ██      ████
         ██ ██   ██ ██  ██      ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██ ██   ██ ██      ██    ██       ██
    ███████ ██████  ██   ██     ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ██   ██ ███████ ██    ██       ██
  `;
  return headingLog;
}

function returnENVLog() {
  let environmentLog = `
    ███████ ████████  █████   ██████  ██ ███    ██  ██████
    ██         ██    ██   ██ ██       ██ ████   ██ ██
    ███████    ██    ███████ ██   ███ ██ ██ ██  ██ ██   ███
         ██    ██    ██   ██ ██    ██ ██ ██  ██ ██ ██    ██
    ███████    ██    ██   ██  ██████  ██ ██   ████  ██████
  `;

  if (env === ENV.PROD) {
    environmentLog = `
      ██████  ██████   ██████  ██████  ██    ██  ██████ ████████ ██  ██████  ███    ██
      ██   ██ ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ████   ██
      ██████  ██████  ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██ ██  ██
      ██      ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
      ██      ██   ██  ██████  ██████   ██████   ██████    ██    ██  ██████  ██   ████
    `;
  } else if (env === ENV.DEV) {
    environmentLog = `
      ██████  ███████ ██    ██
      ██   ██ ██      ██    ██
      ██   ██ █████   ██    ██
      ██   ██ ██       ██  ██
      ██████  ███████   ████
    `;
  }

  return environmentLog;
}
