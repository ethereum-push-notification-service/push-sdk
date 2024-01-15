import { OptionDescription } from "../reusables";

export const INVITE_CHECKBOX_LABEL: { owner: string; admin: string } = {
    owner: 'Only Owner can invite',
    admin: 'Only Admin can invite',
  };
  
 export  const GUILD_COMPARISON_OPTIONS: Array<OptionDescription> = [
    {
      heading: 'ALL',
      value: 'all',
    },
    {
      heading: 'ANY',
      value: 'any',
    },
    {
      heading: 'SPECIFIC',
      value: 'specific',
    },
  ];

 export  const OPERATOR_OPTIONS = [
    {
        heading: 'Any',
        value: 'any',
    },
    {
        heading: 'All',
        value: 'all',
    }
]


export const OPERATOR_OPTIONS_INFO = {
    any:{ 
      head:'Any one',
      tail:'of the following criteria must be true'
    },
    all:{ 
      head:'All',
      tail:'of the following criteria must be true'
    }
} ;


export const ACCESS_TYPE_TITLE = {
  ENTRY: {
    heading: 'Conditions to Join',
    subHeading: 'Add a condition to join or leave it open for everyone',
  },
  CHAT: {
    heading: 'Conditions to Chat',
    subHeading: 'Add a condition to join or leave it open for everyone',
  },
};

export const PENDING_MEMBERS_LIMIT = 5;
export const ACCEPTED_MEMBERS_LIMIT = 5;
export const GUEST_MODE_ADDRESS = '0x0000000000000000000000000000000000000000';

export * from './chainDetails';
