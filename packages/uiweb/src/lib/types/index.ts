import React, { SVGProps } from "react";

export interface IMessageIPFS {
  fromCAIP10: string;
  toCAIP10: string;
  fromDID: string;
  toDID: string;
  messageType: string;
  messageContent: string;
  signature: string;
  sigType: string;
  link: string | null;
  timestamp?: number;
  encType: string;
  encryptedSecret: string;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
}


export interface AccountEnvOptionsType {
  env?: string;
  account: string;
}

export interface ITheme {
  bgColorPrimary?: string,
  bgColorSecondary?: string,
  textColorPrimary?: string,
  textColorSecondary?: string,
  btnColorPrimary?: string,
  btnColorSecondary?: string
  border?:string,
  borderRadius?:string,
  moduleColor?:string,
}
