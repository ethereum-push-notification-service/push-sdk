import * as dotenv from 'dotenv';
import * as path from 'path';

export const mochaHooks = {
  // This file is needed to end the test suite.
    beforeAll: [
      async function () {
      // Load .env file
      const envFound = dotenv.config({ path: path.resolve(__dirname, './.env')})
      // check if .env exists
      if (!envFound) {
        console.log('     .env NOT FOUND     ');
        process.exit(1);
      } else {
        // Check environment setup first
        console.log('     Verifying ENV     ')
        const EnvVerifierLoader = (await require('./loaders/envVerifier')).default
        await EnvVerifierLoader()
        console.log('     ENV Verified / Generated and Loaded!     ')
      }
      },
    ],

  afterAll(done: () => void) {
    done();
    console.log('     ALL TEST CASES EXECUTED     ');
    process.exit(0);
  },
};