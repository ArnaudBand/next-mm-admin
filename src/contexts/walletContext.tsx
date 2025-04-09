"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Define wallet types
export type WalletType = 'metamask' | 'tronlink' | 'solana' | null;

// Wallet info type
interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  type: WalletType;
}

// Wallet context interface
interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  isLoading: boolean;
  walletInfo: WalletInfo | null;
  error: string | null;
  connectWallet: (type: WalletType) => Promise<boolean>;
  disconnectWallet: () => void;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connections on mount
  useEffect(() => {
    const checkExistingConnections = async () => {
      try {
        // Check if MetaMask is connected
        if (window.ethereum && window.ethereum.selectedAddress) {
          const address = window.ethereum.selectedAddress;
          await setupEthereumWallet(address);
          return;
        }
        
        // Check if TronLink is connected
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
          const address = window.tronWeb.defaultAddress.base58;
          await setupTronWallet(address);
          return;
        }
        
        // Check if Solana wallet is connected
        if (window.solana && window.solana.isConnected) {
          const address = window.solana.publicKey.toString();
          await setupSolanaWallet(address);
          return;
        }
      } catch (err) {
        console.error("Error checking existing connections:", err);
      }
    };
    
    checkExistingConnections();
  }, []);

  // Setup Ethereum wallet
  const setupEthereumWallet = async (address: string) => {
    try {
      // Get network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      let network = 'Unknown Network';
      
      // Map chain ID to network name
      const networkMap: Record<string, string> = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0x2a': 'Kovan Testnet',
        '0x89': 'Polygon Mainnet',
        '0xa86a': 'Avalanche Mainnet',
      };
      
      network = networkMap[chainId] || `Chain ID: ${chainId}`;
      
      // Get balance
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert hex balance to ETH
      const balance = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
      
      setWalletInfo({
        address,
        balance: `${balance} ETH`,
        network,
        type: 'metamask',
      });
      
      setConnected(true);
      setError(null);
      
      // Set up event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
      
      return true;
    } catch (err) {
      console.error("Error setting up Ethereum wallet:", err);
      setError("Failed to set up Ethereum wallet");
      return false;
    }
  };
  
  // Handle Ethereum accounts changed
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else if (accounts[0] !== walletInfo?.address) {
      // User switched accounts
      setupEthereumWallet(accounts[0]);
    }
  };
  
  // Handle Ethereum chain changed
  const handleChainChanged = () => {
    // Reload when the chain changes
    window.location.reload();
  };
  
  // Handle Ethereum disconnect
  const handleDisconnect = () => {
    disconnectWallet();
  };

  // Setup TRON wallet
  const setupTronWallet = async (address: string) => {
    try {
      // Get network
      const network = window.tronWeb.fullNode.host.includes('shasta')
        ? 'Shasta Testnet'
        : window.tronWeb.fullNode.host.includes('nile')
        ? 'Nile Testnet'
        : 'TRON Mainnet';
      
      // Get balance
      const balanceInSun = await window.tronWeb.trx.getBalance(address);
      const balance = (balanceInSun / 1e6).toFixed(4); // Convert Sun to TRX
      
      setWalletInfo({
        address,
        balance: `${balance} TRX`,
        network,
        type: 'tronlink',
      });
      
      setConnected(true);
      setError(null);
      
      // Set up event listeners if available
      if (window.tronWeb.eventServer) {
        window.tronWeb.eventServer.on('addressChanged', () => {
          if (window.tronWeb.defaultAddress.base58 !== address) {
            setupTronWallet(window.tronWeb.defaultAddress.base58);
          }
        });
      }
      
      return true;
    } catch (err) {
      console.error("Error setting up TRON wallet:", err);
      setError("Failed to set up TRON wallet");
      return false;
    }
  };

  // Setup Solana wallet
  const setupSolanaWallet = async (address: string) => {
    try {
      // Get network
      const connection = window.solana.connection;
      const network = connection.rpcEndpoint.includes('devnet')
        ? 'Solana Devnet'
        : connection.rpcEndpoint.includes('testnet')
        ? 'Solana Testnet'
        : 'Solana Mainnet';
      
      // Get balance
      const balanceInLamports = await connection.getBalance(window.solana.publicKey);
      const balance = (balanceInLamports / 1e9).toFixed(4); // Convert lamports to SOL
      
      setWalletInfo({
        address,
        balance: `${balance} SOL`,
        network,
        type: 'solana',
      });
      
      setConnected(true);
      setError(null);
      
      // Set up event listeners
      window.solana.on('disconnect', disconnectWallet);
      window.solana.on('accountChanged', () => {
        if (window.solana.publicKey) {
          setupSolanaWallet(window.solana.publicKey.toString());
        } else {
          disconnectWallet();
        }
      });
      
      return true;
    } catch (err) {
      console.error("Error setting up Solana wallet:", err);
      setError("Failed to set up Solana wallet");
      return false;
    }
  };

  // Connect wallet function
  const connectWallet = async (type: WalletType): Promise<boolean> => {
    if (!type) return false;
    
    setIsLoading(true);
    setConnecting(true);
    setError(null);
    
    try {
      if (type === 'metamask') {
        return await connectMetaMask();
      } else if (type === 'tronlink') {
        return await connectTronLink();
      } else if (type === 'solana') {
        return await connectSolanaWallet();
      }
      return false;
    } catch (err: any) {
      console.error(`Error connecting to ${type} wallet:`, err);
      setError(err.message || `Failed to connect to ${type} wallet`);
      return false;
    } finally {
      setIsLoading(false);
      setConnecting(false);
    }
  };

  // Connect to MetaMask
  const connectMetaMask = async (): Promise<boolean> => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask extension first.");
      return false;
    }
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        setError("No accounts found. Please unlock your MetaMask wallet.");
        return false;
      }
      
      return await setupEthereumWallet(accounts[0]);
    } catch (err: any) {
      if (err.code === 4001) {
        // User rejected the request
        setError("User rejected the connection request");
      } else {
        setError(err.message || "Failed to connect to MetaMask");
      }
      return false;
    }
  };

  // Connect to TronLink
  const connectTronLink = async (): Promise<boolean> => {
    if (!window.tronWeb) {
      setError("TronLink is not installed. Please install TronLink extension first.");
      return false;
    }
    
    try {
      // Check if TronLink is locked
      if (!window.tronWeb.defaultAddress.base58) {
        // Request account access if tronWeb is available but not connected
        if (window.tronLink) {
          await window.tronLink.request({ method: 'tron_requestAccounts' });
        } else {
          throw new Error("Please unlock your TronLink wallet");
        }
      }
      
      // Check again after request
      if (!window.tronWeb.defaultAddress.base58) {
        setError("No accounts found. Please unlock your TronLink wallet.");
        return false;
      }
      
      return await setupTronWallet(window.tronWeb.defaultAddress.base58);
    } catch (err: any) {
      if (err.code === 4001) {
        // User rejected the request
        setError("User rejected the connection request");
      } else {
        setError(err.message || "Failed to connect to TronLink");
      }
      return false;
    }
  };

  // Connect to Solana wallet
  const connectSolanaWallet = async (): Promise<boolean> => {
    if (!window.solana) {
      setError("Solana wallet is not installed. Please install Phantom or another Solana wallet extension.");
      return false;
    }
    
    try {
      // Request connection to Solana wallet
      const connected = await window.solana.connect();
      
      if (!connected || !window.solana.publicKey) {
        setError("Failed to connect to Solana wallet");
        return false;
      }
      
      return await setupSolanaWallet(window.solana.publicKey.toString());
    } catch (err: any) {
      if (err.code === 4001) {
        // User rejected the request
        setError("User rejected the connection request");
      } else {
        setError(err.message || "Failed to connect to Solana wallet");
      }
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    // Clean up based on wallet type
    if (walletInfo?.type === 'metamask' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    } else if (walletInfo?.type === 'solana' && window.solana) {
      window.solana.disconnect();
    }
    // For TronLink there's no standard disconnect method
    
    // Reset state
    setConnected(false);
    setWalletInfo(null);
    setError(null);
  }, [walletInfo]);

  // Context value
  const value: WalletContextType = {
    connected,
    connecting,
    isLoading,
    walletInfo,
    error,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for using the wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Type definitions for wallet interfaces
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      selectedAddress?: string;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    tronWeb?: {
      defaultAddress: {
        base58: string;
        hex: string;
      };
      fullNode: {
        host: string;
      };
      trx: {
        getBalance: (address: string) => Promise<number>;
      };
      eventServer?: {
        on: (event: string, callback: (...args: any[]) => void) => void;
      };
    };
    tronLink?: {
      request: (args: { method: string }) => Promise<void>;
    };
    solana?: {
      isPhantom?: boolean;
      publicKey?: {
        toString: () => string;
      };
      connection: {
        rpcEndpoint: string;
        getBalance: (publicKey: any) => Promise<number>;
      };
      isConnected: boolean;
      connect: () => Promise<any>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}