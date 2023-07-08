import { EnvOptionsType, SignerType, ChatStatus } from '../types';
import {
  groupDtoToSpaceDto,
  getSpacesMembersList,
  getSpaceAdminsList,
} from './../chat/helpers';
import { get } from './get';
import { updateGroup } from '../chat/updateGroup';
import getMergeStreamObject from './helpers/getMergeStreamObject';
import { createStream } from 'livepeer';
import { Client } from '@livepeer/webrtmp-sdk';

export interface StartSpaceType extends EnvOptionsType {
  spaceId: string;
  account?: string;
  signer?: SignerType;
  pgpPrivateKey?: string;
}

import type Space from './Space';
import { SPACE_REQUEST_TYPE } from '../payloads/constants';
import { produce } from 'immer';

export async function start(this: Space): Promise<void> {
  try {
    // TODO: Only allow the host to execute this function

    // host should have there audio stream
    if (!this.data.local.stream) {
      throw new Error('Local audio stream not found');
    }

    const space = await get({
      spaceId: this.spaceSpecificData.spaceId,
      env: this.env,
    });

    if (space.status !== ChatStatus.PENDING) {
      throw new Error(
        'Unable to start the space as it is not in the pending state'
      );
    }

    const convertedMembers = getSpacesMembersList(
      space.members,
      space.pendingMembers
    );
    const convertedAdmins = getSpaceAdminsList(
      space.members,
      space.pendingMembers
    );

    const group = await updateGroup({
      chatId: this.spaceSpecificData.spaceId,
      groupName: space.spaceName,
      groupImage: space.spaceImage,
      groupDescription: space.spaceDescription,
      members: convertedMembers,
      admins: convertedAdmins,
      signer: this.signer,
      env: this.env,
      pgpPrivateKey: this.pgpPrivateKey,
      scheduleAt: space.scheduleAt,
      scheduleEnd: space.scheduleEnd,
      status: ChatStatus.ACTIVE,
    });

    // update space data
    this.setSpaceData((oldSpaceData) => {
      return produce(oldSpaceData, (draft) => {
        draft = {
          ...groupDtoToSpaceDto(group),
          connectionData: draft.connectionData,
        };
        draft.connectionData.meta.broadcast = {
          livepeerInfo: null,
          hostAddress: this.data.local.address,
        };
      });
    });

    /*
        - Try calling all the speakers (admins)
        - Create a mesh based webRTC connection with all those who pick up
    */
    this.request({
      senderAddress: this.data.local.address,
      recipientAddress: [...convertedAdmins],
      chatId: this.spaceSpecificData.spaceId,
      details: {
        type: SPACE_REQUEST_TYPE.JOIN,
        data: {},
      },
    });

    // start the livepeer playback and store the playback URL group meta
    // send a notification/meta message to all the added listeners (members) telling the space has started

    // create the mergeStream object
    const mergeStreamObject = getMergeStreamObject(this.data.local.stream);
    // store the mergeStreamObject
    this.mergeStreamObject = mergeStreamObject;

    // create a new livepeer stream object
    const { streamKey, playbackId } = await createStream({
      name: this.spaceSpecificData.spaceName,
      record: true,
    });

    // TODO: store the playbackId on group meta data, temp -> groupDescription
    this.update({ spaceDescription: playbackId });

    // store the stream key
    // this.streamKey = streamKey;

    // cast to the stream
    const client = new Client();
    const session = client.cast(mergeStreamObject.result!, streamKey);
    session.on('open', () => {
      console.log('Live stream started.');
      // TODO: Update the space data
    });

    session.on('close', () => {
      console.log('Live stream stopped.');
      // TODO: Update the space data
    });

    session.on('error', (err) => {
      console.log('Live stream error.', err.message);
      // TODO: Update the space data
    });
  } catch (err) {
    console.error(`[Push SDK] - API  - Error - API ${start.name} -:  `, err);
    throw Error(`[Push SDK] - API  - Error - API ${start.name} -: ${err}`);
  }
}
