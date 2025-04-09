export type WalletType = 'metamask' | 'solana' | 'tron';

export interface WalletState {
  address: string | null;
  balance: string | null;
  connected: boolean;
  walletType: WalletType | null;
  chainId?: string | null;
  networkName?: string | null;
}

export interface WalletActions {
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<string>;
  sendTransaction: (to: string, amount: string) => Promise<any>;
}
