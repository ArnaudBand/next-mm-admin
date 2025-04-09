import { WalletType } from 'types/wallet';
// import TronWeb from 'tronweb';

// Safely check if a property exists on window
export const isWindowObject = (): boolean => {
  return typeof window !== 'undefined';
};

export const isTronWebAvailable = (): boolean => {
  return isWindowObject() && 'tronWeb' in window;
};

export const isMetaMaskAvailable = (): boolean => {
  return isWindowObject() && 'ethereum' in window && window.ethereum?.isMetaMask;
};

export const isSolanaAvailable = (): boolean => {
  return isWindowObject() && 'solana' in window && window.solana?.isPhantom;
};

export const getProviderForWalletType = (walletType: WalletType) => {
  switch (walletType) {
    case 'metamask':
      return isWindowObject() ? window.ethereum : null;
    case 'solana':
      return isWindowObject() ? window.solana : null;
    case 'tron':
      return isWindowObject() ? window.tronWeb : null;
    default:
      return null;
  }
};

export const formatAddress = (address: string, walletType: WalletType): string => {
  if (!address) return '';
  
  // Truncate the address for display
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 4);
  return `${start}...${end}`;
};

export const formatBalance = (balance: string, decimals: number = 18): string => {
  if (!balance) return '0';
  
  // Convert from smallest unit (wei/lamports/sun) to main unit (ETH/SOL/TRX)
  const balanceNumber = parseFloat(balance) / Math.pow(10, decimals);
  return balanceNumber.toFixed(4);
};