import * as openpgp from 'openpgp';

interface IPGPHelper{
  generateKeyPair(): Promise<{ privateKeyArmored: string; publicKeyArmored: string }>;
  sign ({ message, signingKey }: { message: string; signingKey: string }): Promise<string>;
  pgpEncrypt ({ plainText, keys }: { plainText: string; keys: Array<string> }): Promise<string>;
  pgpDecrypt({cipherText,toPrivateKeyArmored}: { cipherText: any, toPrivateKeyArmored: string}): Promise<string>;
  verifySignature({ messageContent, signatureArmored, publicKeyArmored, }: {messageContent: string;signatureArmored: string; publicKeyArmored: string;}): Promise<void>
}

const PGPHelper:IPGPHelper = {
  async generateKeyPair(){
    const keys = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 2048,
      userIDs: [{ name: '', email: '' }]
    })
    return {
      privateKeyArmored: keys.privateKey,
      publicKeyArmored: keys.publicKey
    }
  },

  async sign ({ message, signingKey }): Promise<string> {
    const messageObject: openpgp.Message<string> = await openpgp.createMessage({ text: message })
    const privateKey: openpgp.PrivateKey = await openpgp.readPrivateKey({ armoredKey: signingKey })
    return <string>await openpgp.sign({ message: messageObject, signingKeys: privateKey, detached: true })
  },

  async pgpEncrypt ({ plainText, keys }): Promise<string> {
    const pgpKeys: openpgp.Key[] = [];
  
    for(let i = 0; i < keys.length; i++) {
      pgpKeys.push(await openpgp.readKey({ armoredKey: keys[i] }));
    }
    const message: openpgp.Message<string> = await openpgp.createMessage({ text: plainText });
    const encrypted: string = <string>await openpgp.encrypt({
      message: message,
      encryptionKeys: pgpKeys,
    });
    return encrypted;
  },

  async pgpDecrypt({
    cipherText,
    toPrivateKeyArmored
  }: {
    cipherText: any
    toPrivateKeyArmored: string
  }): Promise<string>{
    
    const message = await openpgp.readMessage({ armoredMessage: cipherText })
    const privateKey: openpgp.PrivateKey = await openpgp.readPrivateKey({ armoredKey: toPrivateKeyArmored })
  
    const { data: decrypted } = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey
    })

    return decrypted as string
  },

  async verifySignature({
    messageContent,
    signatureArmored,
    publicKeyArmored, 
  }: {
    messageContent: string
    signatureArmored: string
    publicKeyArmored: string
  }): Promise<void> {
    const message: openpgp.Message<string> = await openpgp.createMessage({ text: messageContent })
    const signature: openpgp.Signature = await openpgp.readSignature({
      armoredSignature: signatureArmored
    })
    const publicKey: openpgp.PublicKey = await openpgp.readKey({ armoredKey: publicKeyArmored })
    const verificationResult = await openpgp.verify({
      message,
      signature,
      verificationKeys: publicKey
    })
    const { verified } = verificationResult.signatures[0]
    try {
      await verified
    } catch (e) {
      throw new Error('Signature could not be verified: ' + e)
    }
  }

}

export {IPGPHelper, PGPHelper}

export const generateKeyPair = async (): Promise<{ privateKeyArmored: string; publicKeyArmored: string }> => {
  const keys = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name: '', email: '' }]
  })
  return {
    privateKeyArmored: keys.privateKey,
    publicKeyArmored: keys.publicKey
  }
}

export const pgpEncrypt = async ({
  plainText,
  keys,
}: {
  plainText: string
  keys: Array<string>
}): Promise<string> => {

  const pgpKeys: openpgp.Key[] = [];

  for(let i = 0; i < keys.length; i++) {
    pgpKeys.push(await openpgp.readKey({ armoredKey: keys[i] }))
  }
  const message: openpgp.Message<string> = await openpgp.createMessage({ text: plainText })
  const encrypted: string = <string>await openpgp.encrypt({
    message: message,
    encryptionKeys: pgpKeys
  })
  return encrypted
}

export const sign = async ({ message, signingKey }: { message: string; signingKey: string }): Promise<string> => {
  const messageObject: openpgp.Message<string> = await openpgp.createMessage({ text: message })
  const privateKey: openpgp.PrivateKey = await openpgp.readPrivateKey({ armoredKey: signingKey })
  return <string>await openpgp.sign({ message: messageObject, signingKeys: privateKey, detached: true })
}

export const verifySignature = async ({
  messageContent,
  signatureArmored,
  publicKeyArmored, 
}: {
  messageContent: string
  signatureArmored: string
  publicKeyArmored: string
}): Promise<void> => {
  const message: openpgp.Message<string> = await openpgp.createMessage({ text: messageContent })
  const signature: openpgp.Signature = await openpgp.readSignature({
    armoredSignature: signatureArmored
  })
  const publicKey: openpgp.PublicKey = await openpgp.readKey({ armoredKey: publicKeyArmored })
  const verificationResult = await openpgp.verify({
    message,
    signature,
    verificationKeys: publicKey
  })
  const { verified } = verificationResult.signatures[0]
  try {
    await verified
  } catch (e) {
    throw new Error('Signature could not be verified: ' + e)
  }
}

export const pgpDecrypt = async ({
  cipherText,
  toPrivateKeyArmored
}: {
  cipherText: any
  toPrivateKeyArmored: string
}): Promise<string> => {
  const message = await openpgp.readMessage({ armoredMessage: cipherText })
  const privateKey: openpgp.PrivateKey = await openpgp.readPrivateKey({ armoredKey: toPrivateKeyArmored })

  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey
  })

  return decrypted as string
}
