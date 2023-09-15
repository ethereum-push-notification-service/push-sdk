/**
 * connect.ts
 *
 * The 'connect' function is responsible for establishing peer connections
 * 
 * @param {IConnectOptions} options - An object containing signal data and a peer address.
 */
import { produce } from "immer";

import { SpaceV2 } from "./SpaceV2";

import { VideoCallStatus } from "../types";
import getIncomingIndexFromAddress from "../video/helpers/getIncomingIndexFromAddress";

export interface IConnectOptions {
    signalData: any;
    peerAddress: string;
}

export async function connect(
    this: SpaceV2,
    options: IConnectOptions
) {
    const { peerAddress, signalData } = options || {};

    try {
        const peerConnection = this.getPeerConnection(
            peerAddress ? peerAddress : this.data.pendingPeerStreams[0].address
        ) as any;

        peerConnection?.on('error', (err: any) => {
            console.log('error in connect', err);

            const pendingIndex = peerAddress
                ? getIncomingIndexFromAddress(this.data.pendingPeerStreams, peerAddress)
                : 0;

            if (this.data.pendingPeerStreams[pendingIndex].retryCount >= 5) {
                console.log('Max retries exceeded, please try again.');
                this.disconnect({
                    peerAddress: peerAddress
                        ? peerAddress
                        : this.data.pendingPeerStreams[0].address,
                });
            }

            // retrying in case of connection error
            this.invite({
                senderAddress: this.data.local.address,
                recipientAddress: this.data.pendingPeerStreams[pendingIndex].address,
                spaceId: this.data.spaceInfo.spaceId,
                retry: true,
            });
        })

        peerConnection?.signal(signalData);

        // update space data
        this.setSpaceV2Data((oldSpaceData) => {
            return produce(oldSpaceData, (draft) => {
                const pendingIndex = peerAddress
                    ? getIncomingIndexFromAddress(oldSpaceData.pendingPeerStreams, peerAddress)
                    : 0;
                draft.pendingPeerStreams[pendingIndex].status = VideoCallStatus.CONNECTED;
            });
        });
    } catch (err) {
        console.error(`[Push SDK] - API  - Error - API ${connect.name} -:  `, err);
        throw Error(`[Push SDK] - API  - Error - API ${connect.name} -: ${err}`);
    }
}
