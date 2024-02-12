import * as payloadEncHelpers from '../../../src/lib/payloads/encHelpers';
import { expect } from 'chai';
import { generateKeyPair } from '../../../src/lib/chat/helpers/pgp';
import * as testData from './testData';
describe('payload/encHelpers.ts', () => {
  describe('generateRandomNonce', () => {
    it('Should generate random nonce of length 10', () => {
      const nonce = payloadEncHelpers.generateRandomNonce(10);
      expect(nonce.length).equal(10);
    });
  });

  describe('aesEncryption', () => {
    it('Should encrypt the payload with the nonce', () => {
      const payload = {
        message: JSON.stringify(testData.TEST_PAYLOAD),
        secret: testData.TEST_NOCE
      };
      const encryptedPayload = payloadEncHelpers.aesEncryption(payload);
      expect(encryptedPayload).not.null;
    });

    it('Should encrypt the payload with the nonce and be able to decrypt it', () => {
      const payload = {
        message: JSON.stringify(testData.TEST_PAYLOAD),
        secret: testData.TEST_NOCE
      };
      const encryptedPayload = payloadEncHelpers.aesEncryption(payload);
      expect(encryptedPayload).not.null;
      const payloadToBeDecrypted = {
        encryptedMessage: encryptedPayload,
        secret: testData.TEST_NOCE
      };
      const decryptedPayload =
        payloadEncHelpers.aesDecryption(payloadToBeDecrypted);
      expect(decryptedPayload).to.be.equal(
        JSON.stringify(testData.TEST_PAYLOAD)
      );
    });
  });

  describe('pgpEncryption', () => {
    let pgpKeys: any = null;
    beforeEach(async () => {
      pgpKeys = await generateKeyPair();
    });
    it('Should encrypt the nonce with the pgp public key', async () => {
      const encrypotedNonce = await payloadEncHelpers.encryptViaPGP({
        text: testData.TEST_NOCE,
        keys: [pgpKeys.publicKeyArmored]
      });
      expect(encrypotedNonce).not.null;
    });

    it('Should encrypt the nonce and be able to decrypt it', async () => {
      const encrypotedNonce = await payloadEncHelpers.encryptViaPGP({
        text: testData.TEST_NOCE,
        keys: [pgpKeys.publicKeyArmored]
      });

      const decryptedNonce = await payloadEncHelpers.decryptViaPGP({
        cipherText: encrypotedNonce,
        pgpPrivateKey: pgpKeys.privateKeyArmored
      });

      expect(decryptedNonce).to.be.equal(testData.TEST_NOCE)
    });
  });

  describe("encrypt via public private key", async()=>{
    it("Should be able to encrpt and decrypt", async()=>{
      const encryptedMessage = await payloadEncHelpers.encryptViaPK({
        publicKey: testData.TEST_PUBLIC_KEY,
        message: JSON.stringify(testData.TEST_PAYLOAD)
      })

      const decryptedMessage = await payloadEncHelpers.decryptViaPK({
        privateKey: testData.TEST_PRIVATE_KEY,
        encMessage: encryptedMessage as string
      })

     expect(decryptedMessage).to.be.equal(JSON.stringify(testData.TEST_PAYLOAD))
    })
  })
});
