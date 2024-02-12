import { Lit } from '../../../src/lib/payloads/litHelper';
import { ENV } from '../../../src/lib/constants';
import { expect } from 'chai';
import { ethers } from 'ethers';

describe('Lit helpers', () => {
  let signer1: any;
  let account1: any;
  let decrypterSigner: any;
  const recipientSigner = new ethers.Wallet(
    `0x${process.env['WALLET_RECIPIENT_PK']}`
  );
  let recipientAccount : any;
  beforeEach(async () => {
    signer1 = new ethers.Wallet(`0x${process.env['WALLET_PRIVATE_KEY']}`);
    account1 = await signer1.getAddress();
    decrypterSigner = new ethers.Wallet(`0x${process.env['WALLET_PRIVATE_KEY_2']}`);
    recipientAccount = await recipientSigner.getAddress();
  });
  describe('connect', async () => {
    it("Should connect", async()=>{
      const lit = new Lit(signer1);
      const connect = await lit.connect();
    })
  });

  describe('encrypt', async () => {
    it("Should encrypt", async()=>{
      const lit = new Lit(signer1);
      await lit.connect();
      const litEncryption = await lit.encrypt("test", "0xD8634C39BBFd4033c0d3289C4515275102423681")
      console.log(litEncryption)
    })
  });

  describe('dencrypt', async () => {
    it("Should dencrypt", async()=>{
      const lit = new Lit(recipientSigner);
      await lit.connect();
      const litEncryption = await lit.encrypt(recipientAccount, "abcd")
      console.log(litEncryption)
      const decrypted = await lit.decrypt({ciphertext: litEncryption?.ciphertext as string, dataToEncryptHash: litEncryption?.dataToEncryptHash as string})
      console.log(decrypted)
    })
  });

  describe('dencrypt', async () => {
    it("Should dencrypt", async()=>{
      const lit = new Lit(signer1);
      await lit.connect();
      const litEncryption = await lit.encrypt("0xC8c243a4fd7F34c49901fe441958953402b7C024", "abcd")
      const decypterLit = new Lit(decrypterSigner)
      const decrypted = await  decypterLit.decrypt({ciphertext: litEncryption?.ciphertext as string, dataToEncryptHash: litEncryption?.dataToEncryptHash as string})
      console.log("decrypted")
      console.log(decrypted)
    })
  });
});
