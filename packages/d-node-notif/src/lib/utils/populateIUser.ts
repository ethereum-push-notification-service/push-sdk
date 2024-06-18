import { IUser } from '../types';

/**
 *  To be removed in v2 verisons of sdk
 * @param user
 * @returns User with deprecated params
 */
export const populateDeprecatedUser = (user: IUser): IUser => {
  if (!user) return user;
  user.name = user.profile.name;
  user.about = user.profile.desc;
  user.profilePicture = user.profile.picture;
  user.numMsg = user.msgSent;
  user.allowedNumMsg = user.maxMsgPersisted;
  let encryptionType = '';
  let sigType = '';
  let signature = '';
  try {
    const { version } = JSON.parse(user.encryptedPrivateKey);
    encryptionType = version;
  } catch (err) {
    //ignore since no encryption found
  }
  user.encryptionType = encryptionType;
  try {
    sigType = user.verificationProof.split(':')[0];
    signature = user.verificationProof.split(':')[1];
  } catch (err) {
    //ignore since no verification proof found
  }
  user.signature = signature;
  user.sigType = sigType;
  user.encryptedPassword = null;
  //TODO FOR NFT PROFILE
  user.nftOwner = null;
  user.linkedListHash = null;
  user.nfts = null;
  return user;
};
