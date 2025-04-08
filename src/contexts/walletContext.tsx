'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define wallet types
export type WalletType = 'metamask' | 'tronlink' | 'solana' | null;

// Define error types for better debugging
export interface WalletError {
  type: string;
  message: string;
  details?: any;
}

interface WalletContextType {
  connected: boolean;
  walletType: WalletType;
  address: string | null;
  balance: string | null;
  connectWallet: (type: WalletType) => Promise<boolean>;
  disconnectWallet: () => void;
  isLoading: boolean;
  lastError: WalletError | null;
  checkWalletAvailability: (type: WalletType) => boolean;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  walletType: null,
  address: null,
  balance: null,
  connectWallet: async () => false,
  disconnectWallet: () => {},
  isLoading: false,
  lastError: null,
  checkWalletAvailability: () => false,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [connected, setConnected] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<WalletError | null>(null);

  // Check if previously connected
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletType') as WalletType;
    if (savedWallet) {
      console.log(`Found saved wallet type: ${savedWallet}, attempting to reconnect...`);
      connectWallet(savedWallet);
    }
  }, []);

  // Check if a specific wallet is available
  const checkWalletAvailability = (type: WalletType): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      switch (type) {
        case 'metamask':
          const { ethereum } = window as any;
          return !!ethereum && !!ethereum.isMetaMask;
        case 'tronlink':
          const tronWeb = (window as any).tronWeb;
          return !!tronWeb;
        case 'solana':
          const solana = (window as any).solana || (window as any).phantom?.solana;
          return !!solana;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking ${type} availability:`, error);
      return false;
    }
  };

  // Connect to wallet
  const connectWallet = async (type: WalletType): Promise<boolean> => {
    setIsLoading(true);
    setLastError(null);
    
    // First, check if the wallet is available
    if (!checkWalletAvailability(type)) {
      const errorMessage = `${type} wallet is not installed or not accessible`;
      console.error(errorMessage);
      setLastError({
        type: 'WALLET_NOT_FOUND',
        message: errorMessage
      });
      setIsLoading(false);
      return false;
    }
    
    console.log(`Attempting to connect to ${type}...`);
    
    try {
      switch (type) {
        case 'metamask':
          return await connectMetaMask();
        case 'tronlink':
          return await connectTronLink();
        case 'solana':
          return await connectSolana();
        default:
          setLastError({
            type: 'INVALID_WALLET',
            message: 'Invalid wallet type specified'
          });
          return false;
      }
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
      setLastError({
        type: `${type.toUpperCase()}_CONNECTION_ERROR`,
        message: `Failed to connect to ${type}: ${'Unknown error'}`,
        details: error
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // MetaMask connection
  const connectMetaMask = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    // Check if MetaMask is installed
    const { ethereum } = window as any;
    if (!ethereum || !ethereum.isMetaMask) {
      setLastError({
        type: 'METAMASK_NOT_FOUND',
        message: 'MetaMask extension not found'
      });
      return false;
    }
    
    console.log("Connecting to Ethereum via MetaMask...");
    
    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        setLastError({
          type: 'NO_ACCOUNTS',
          message: 'No Ethereum accounts available'
        });
        return false;
      }
      
      const account = accounts[0];
      console.log(`MetaMask account connected: ${account}`);
      
      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });
      
      // Convert balance from wei to ETH
      const ethBalance = parseInt(balance, 16) / 1e18;
      
      setAddress(account);
      setBalance(ethBalance.toFixed(4));
      setWalletType('metamask');
      setConnected(true);
      
      // Save connection info
      localStorage.setItem('walletType', 'metamask');
      
      // Set up listeners for account changes
      ethereum.on('accountsChanged', (newAccounts: string[]) => {
        console.log('MetaMask accounts changed:', newAccounts);
        if (newAccounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(newAccounts[0]);
          // Update balance for the new account
          updateMetaMaskBalance(newAccounts[0]);
        }
      });
      
      // Listen for chain changes
      ethereum.on('chainChanged', (chainId: string) => {
        console.log('MetaMask chain changed:', chainId);
        // Refresh the page when the chain changes
        window.location.reload();
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setLastError({
        type: 'METAMASK_CONNECTION_ERROR',
        message: `MetaMask connection error: ${'Unknown error'}`,
        details: error
      });
      return false;
    }
  };
  
  // Helper function to update MetaMask balance
  const updateMetaMaskBalance = async (account: string) => {
    const { ethereum } = window as any;
    if (!ethereum) return;
    
    try {
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });
      
      const ethBalance = parseInt(balance, 16) / 1e18;
      setBalance(ethBalance.toFixed(4));
    } catch (error) {
      console.error('Error updating MetaMask balance:', error);
    }
  };

  // TronLink connection
  const connectTronLink = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    // Check if TronLink is installed
    const tronWeb = (window as any).tronWeb;
    if (!tronWeb) {
      setLastError({
        type: 'TRONLINK_NOT_FOUND',
        message: 'TronLink extension not found'
      });
      return false;
    }

    console.log("Connecting to TRON via TronLink...");
    console.log("TronWeb ready state:", tronWeb.ready);

    try {
      // Wait for permission
      if (!tronWeb.ready) {
        console.log("TronLink not ready, requesting accounts...");
        // Check if tronLink object exists
        if (!(window as any).tronLink) {
          setLastError({
            type: 'TRONLINK_NOT_INITIALIZED',
            message: 'TronLink is installed but not initialized'
          });
          return false;
        }
        
        // Request access
        try {
          await (window as any).tronLink.request({ method: 'tron_requestAccounts' });
          // Wait a moment for TronLink to update
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (requestError) {
          console.error('Error requesting TronLink accounts:', requestError);
          setLastError({
            type: 'TRONLINK_REQUEST_ERROR',
            message: `TronLink request error: ${'Unknown error'}`,
            details: requestError
          });
          return false;
        }
      }
      
      // Check if permission was granted
      if (!tronWeb.ready) {
        console.log("TronLink still not ready after request");
        setLastError({
          type: 'TRONLINK_NOT_READY',
          message: 'Please unlock TronLink and authorize this site'
        });
        return false;
      }
      
      // Get account and balance
      const account = tronWeb.defaultAddress.base58;
      console.log(`TronLink account connected: ${account}`);
      
      if (!account) {
        setLastError({
          type: 'NO_TRON_ACCOUNT',
          message: 'No TRON account available'
        });
        return false;
      }
      
      const balanceInSun = await tronWeb.trx.getBalance(account);
      const trxBalance = balanceInSun / 1e6; // Convert from SUN to TRX
      
      setAddress(account);
      setBalance(trxBalance.toFixed(4));
      setWalletType('tronlink');
      setConnected(true);
      
      // Save connection info
      localStorage.setItem('walletType', 'tronlink');
      
      // Set up event listener for account changes
      window.addEventListener('message', function(e) {
        if (e.data.message && e.data.message.action === 'setAccount') {
          console.log('TronLink account changed:', e.data.message);
          if (e.data.message.data.address) {
            setAddress(tronWeb.address.fromHex(e.data.message.data.address));
            updateTronLinkBalance(tronWeb.address.fromHex(e.data.message.data.address));
          } else {
            disconnectWallet();
          }
        } else if (e.data.message && e.data.message.action === 'setNode') {
          console.log('TronLink network changed:', e.data.message);
          // Network changed
          window.location.reload();
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting to TronLink:', error);
      setLastError({
        type: 'TRONLINK_CONNECTION_ERROR',
        message: `TronLink connection error: ${'Unknown error'}`,
        details: error
      });
      return false;
    }
  };
  
  // Helper function to update TronLink balance
  const updateTronLinkBalance = async (account: string) => {
    const tronWeb = (window as any).tronWeb;
    if (!tronWeb) return;
    
    try {
      const balanceInSun = await tronWeb.trx.getBalance(account);
      const trxBalance = balanceInSun / 1e6;
      setBalance(trxBalance.toFixed(4));
    } catch (error) {
      console.error('Error updating TronLink balance:', error);
    }
  };

  // Solana connection
  const connectSolana = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    // Check if Solana wallet (like Phantom) is installed
    const solana = (window as any).solana || (window as any).phantom?.solana;
    if (!solana) {
      setLastError({
        type: 'SOLANA_WALLET_NOT_FOUND',
        message: 'Solana wallet like Phantom not found'
      });
      return false;
    }

    console.log("Connecting to Solana wallet...");

    try {
      // Request connection
      const resp = await solana.connect();
      const publicKey = resp.publicKey.toString();
      console.log(`Solana wallet connected: ${publicKey}`);
      
      // For Solana, getting balance typically requires an RPC connection
      // This is simplified - in a real app you'd use a library like @solana/web3.js
      setAddress(publicKey);
      setBalance('Loading...'); // Placeholder for demo
      
      // In a real app, you might fetch the balance like this:
      // const connection = new Connection('https://api.mainnet-beta.solana.com');
      // const balance = await connection.getBalance(new PublicKey(publicKey));
      // setBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
      
      setWalletType('solana');
      setConnected(true);
      
      // Save connection info
      localStorage.setItem('walletType', 'solana');
      
      // Set up listeners
      solana.on('accountChanged', () => {
        console.log('Solana account changed');
        // Reload when account changes
        window.location.reload();
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting to Solana wallet:', error);
      setLastError({
        type: 'SOLANA_CONNECTION_ERROR',
        message: `Solana wallet connection error: ${'Unknown error'}`,
        details: error
      });
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    console.log("Disconnecting wallet");
    setConnected(false);
    setWalletType(null);
    setAddress(null);
    setBalance(null);
    setLastError(null);
    localStorage.removeItem('walletType');
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletType,
        address,
        balance,
        connectWallet,
        disconnectWallet,
        isLoading,
        lastError,
        checkWalletAvailability,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};