export type TokenReply = { validatorToken: string; validatorUrl: string };

export type PingReply = {
  nodeId: string;
  tsMillis: number;
  status: string;
};

export type ActiveValidator = {
  nodeWallet: string;
  nodeApiBaseUrl: string;
};

/**
 * @description Validator contract interface ( VIEM CLIENT )
 */
export type ValidatorContract = {
  read: {
    getActiveVNodes(): Promise<ActiveValidator[]>;
    nodeMap(address: string): Promise<NodeInfo>;
  };
};

type NodeInfo = {
  ownerWallet: string;
  nodeWallet: string;
  nodeType: NodeType;
  nodeApiBaseUrl: string;
  status: NodeStatus;
};

enum NodeType {
  VNode = 0, // validator 0
  SNode = 1, // storage 1
  DNode = 2, // delivery 2
}

enum NodeStatus {
  OK,
  Reported,
  Slashed,
  BannedAndUnstaked,
  Unstaked,
}
