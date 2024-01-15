import { Env, IMessageIPFS, IUser, PushAPI, SignerType } from "@pushprotocol/restapi";
import { Constants } from "../config";
import { createContext } from "react";


export interface IChatDataContextValues {

  account: string | null;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
  signer: SignerType | undefined;
  setSigner: React.Dispatch<React.SetStateAction<SignerType | undefined>>;
  env: Env;
  setEnv: React.Dispatch<React.SetStateAction<Env>>;
  pushChatStream: any;
  setPushChatStream: React.Dispatch<React.SetStateAction<any>>;
  isPushChatStreamConnected: boolean;
  setIsPushChatStreamConnected: React.Dispatch<React.SetStateAction<boolean>>;
  pushUser: PushAPI | undefined;
  setPushUser: React.Dispatch<React.SetStateAction<PushAPI>>;

}

export const initialChatDataContextValues: IChatDataContextValues = {
  account: null,
  setAccount: () => {
    /**/
  },
  signer: undefined,
  setSigner: () => {
    /**/
  },
  env: Constants.ENV.PROD,
  setEnv: () => {
    /**/
  },
  pushChatStream: null,
  setPushChatStream: () => {
    /** */
  },
  isPushChatStreamConnected: false,
  setIsPushChatStreamConnected: () => {
    /** */
  },
  pushUser: undefined,
  setPushUser: () => {
    /** */
  },

}


export const ChatDataContext = createContext<IChatDataContextValues>(
  initialChatDataContextValues
);