export const validatorABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'valPerBlock',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'valPerBlockTarget',
        type: 'uint16',
      },
    ],
    name: 'BlockParamsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'ownerWallet',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum ValidatorV1.NodeType',
        name: 'nodeType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nodeTokens',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'nodeApiBaseUrl',
        type: 'string',
      },
    ],
    name: 'NodeAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'nodeWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'reporterWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'voters',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'enum ValidatorV1.VoteAction',
        name: 'voteAction',
        type: 'uint8',
      },
    ],
    name: 'NodeReported',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nodeWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum ValidatorV1.NodeStatus',
        name: 'nodeStatus',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nodeTokens',
        type: 'uint256',
      },
    ],
    name: 'NodeStatusChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'nodeRandomMinCount',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'nodeRandomPingCount',
        type: 'uint16',
      },
    ],
    name: 'RandomParamsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BAN_PERCENT',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REPORTS_BEFORE_SLASH_S',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REPORTS_BEFORE_SLASH_V',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REPORT_THRESHOLD_PER_BLOCK',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SLASHES_BEFORE_BAN_S',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SLASHES_BEFORE_BAN_V',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SLASH_PERCENT',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'dnodes',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveVNodes',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'nodeWallet',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'nodeApiBaseUrl',
            type: 'string',
          },
        ],
        internalType: 'struct ValidatorV1.ActiveValidator[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDNodes',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDNodesLength',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nodeWallet',
        type: 'address',
      },
    ],
    name: 'getNodeInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'ownerWallet',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'nodeWallet',
            type: 'address',
          },
          {
            internalType: 'enum ValidatorV1.NodeType',
            name: 'nodeType',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'nodeTokens',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'nodeApiBaseUrl',
            type: 'string',
          },
          {
            components: [
              {
                internalType: 'uint16',
                name: 'reportCounter',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'slashCounter',
                type: 'uint16',
              },
              {
                internalType: 'uint128[]',
                name: 'reportedInBlocks',
                type: 'uint128[]',
              },
              {
                internalType: 'address[]',
                name: 'reportedBy',
                type: 'address[]',
              },
              {
                internalType: 'uint128[]',
                name: 'reportedKeys',
                type: 'uint128[]',
              },
            ],
            internalType: 'struct ValidatorV1.NodeCounters',
            name: 'counters',
            type: 'tuple',
          },
          {
            internalType: 'enum ValidatorV1.NodeStatus',
            name: 'status',
            type: 'uint8',
          },
        ],
        internalType: 'struct ValidatorV1.NodeInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSNodes',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSNodesLength',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVNodes',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVNodesLength',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'protocolVersion_',
        type: 'uint16',
      },
      {
        internalType: 'address',
        name: 'pushToken_',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'valPerBlockTarget_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'nodeRandomMinCount_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'nodeRandomPingCount_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'REPORTS_BEFORE_SLASH_V_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'REPORTS_BEFORE_SLASH_S_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'SLASHES_BEFORE_BAN_V_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'SLASHES_BEFORE_BAN_S_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'SLASH_PERCENT_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'BAN_PERCENT_',
        type: 'uint16',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minStakeD',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minStakeS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minStakeV',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'nodeMap',
    outputs: [
      {
        internalType: 'address',
        name: 'ownerWallet',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'nodeWallet',
        type: 'address',
      },
      {
        internalType: 'enum ValidatorV1.NodeType',
        name: 'nodeType',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'nodeTokens',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'nodeApiBaseUrl',
        type: 'string',
      },
      {
        components: [
          {
            internalType: 'uint16',
            name: 'reportCounter',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'slashCounter',
            type: 'uint16',
          },
          {
            internalType: 'uint128[]',
            name: 'reportedInBlocks',
            type: 'uint128[]',
          },
          {
            internalType: 'address[]',
            name: 'reportedBy',
            type: 'address[]',
          },
          {
            internalType: 'uint128[]',
            name: 'reportedKeys',
            type: 'uint128[]',
          },
        ],
        internalType: 'struct ValidatorV1.NodeCounters',
        name: 'counters',
        type: 'tuple',
      },
      {
        internalType: 'enum ValidatorV1.NodeStatus',
        name: 'status',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nodeRandomMinCount',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nodeRandomPingCount',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocolVersion',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
    ],
    name: 'redistributeStaked',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nodeTokens_',
        type: 'uint256',
      },
      {
        internalType: 'enum ValidatorV1.NodeType',
        name: 'nodeType_',
        type: 'uint8',
      },
      {
        internalType: 'string',
        name: 'nodeApiBaseUrl_',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'nodeWallet_',
        type: 'address',
      },
    ],
    name: 'registerNodeAndStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum ValidatorV1.NodeType',
        name: 'targetNodeType_',
        type: 'uint8',
      },
      {
        internalType: 'bytes',
        name: 'voteBlob_',
        type: 'bytes',
      },
      {
        internalType: 'bytes[]',
        name: 'signatures_',
        type: 'bytes[]',
      },
    ],
    name: 'reportNode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr_',
        type: 'address',
      },
    ],
    name: 'setStorageContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'snodes',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'storageContract',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalFees',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalStaked',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
    ],
    name: 'unstakeFees',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'nodeWallet_',
        type: 'address',
      },
    ],
    name: 'unstakeNode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'valPerBlockTarget_',
        type: 'uint16',
      },
    ],
    name: 'updateBlockParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'nodeRandomMinCount_',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'nodeRandomPingCount_',
        type: 'uint16',
      },
    ],
    name: 'updateRandomParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'valPerBlock',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'valPerBlockTarget',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'vnodes',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vnodesActive',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
