"use client"

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction as SolanaTransaction } from '@solana/web3.js';
import { WalletType, WalletState, WalletActions } from 'types/wallet';
import { 
  isWindowObject, 
  isMetaMaskAvailable, 
  isSolanaAvailable, 
  isTronWebAvailable,
  getProviderForWalletType,
  formatBalance
} from 'utils/walletUtils';

const INITIAL_STATE: WalletState = {
  address: null,
  balance: null,
  connected: false,
  walletType: null,
  chainId: null,
  networkName: null
};

export const useWallet = (): [WalletState, WalletActions] => {
  const [walletState, setWalletState] = useState<WalletState>(INITIAL_STATE);

  // Initialize wallet listeners
  useEffect(() => {
    if (!isWindowObject()) return;

    // Set up MetaMask event listeners if connected
    if (walletState.walletType === 'metamask' && isMetaMaskAvailable()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnect();
        } else if (accounts[0] !== walletState.address) {
          // Account changed
          setWalletState(prev => ({ ...prev, address: accounts[0] }));
          getBalance();
        }
      };

      const handleChainChanged = (chainId: string) => {
        // Handle chain changes
        setWalletState(prev => ({ ...prev, chainId }));
        // We should refresh the page as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }

    // Set up Solana event listeners if connected
    if (walletState.walletType === 'solana' && isSolanaAvailable()) {
      const handleDisconnect = () => {
        disconnect();
      };

      window.solana.on('disconnect', handleDisconnect);

      return () => {
        window.solana.disconnect();
      };
    }
  }, [walletState.walletType, walletState.address]);

  // Connect to wallet
  const connect = useCallback(async (walletType: WalletType) => {
    try {
      switch (walletType) {
        case 'metamask': {
          if (!isMetaMaskAvailable()) {
            throw new Error('MetaMask is not installed');
          }

          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(accounts[0]);

          setWalletState({
            address: accounts[0],
            balance: ethers.utils.formatEther(balance),
            connected: true,
            walletType: 'metamask',
            chainId: network.chainId.toString(),
            networkName: network.name
          });
          break;
        }

        case 'solana': {
          if (!isSolanaAvailable()) {
            throw new Error('Phantom wallet is not installed');
          }

          // Connect to Phantom wallet
          const resp = await window.solana.connect();
          const publicKey = resp.publicKey.toString();
          
          // Get balance
          const connection = new Connection('https://api.mainnet-beta.solana.com');
          const balance = await connection.getBalance(new PublicKey(publicKey));

          setWalletState({
            address: publicKey,
            balance: (balance / LAMPORTS_PER_SOL).toString(),
            connected: true,
            walletType: 'solana',
            networkName: 'mainnet-beta'
          });
          break;
        }

        case 'tron': {
          if (!isTronWebAvailable()) {
            throw new Error('TronLink is not installed');
          }

          // Wait for TronLink to be ready
          if (!window.tronWeb.defaultAddress) {
            throw new Error('Please unlock your TronLink wallet');
          }

          const address = window.tronWeb.defaultAddress.base58;
          
          // Get balance
          const balance = await window.tronWeb.trx.getBalance(address);

          setWalletState({
            address,
            balance: (balance / 1e6).toString(), // Convert SUN to TRX
            connected: true,
            walletType: 'tron',
            networkName: window.tronWeb.fullNode.host.includes('shasta') ? 'shasta' : 'mainnet'
          });
          break;
        }

        default:
          throw new Error('Unsupported wallet type');
      }
    } catch (error) {
      console.error('Failed to connect wallet', error);
      throw error;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      if (walletState.walletType === 'solana' && isSolanaAvailable()) {
        await window.solana.disconnect();
      }

      // For MetaMask and TronWeb, we just clear the state
      setWalletState(INITIAL_STATE);
    } catch (error) {
      console.error('Failed to disconnect wallet', error);
      throw error;
    }
  }, [walletState.walletType]);

  // Get wallet balance
  const getBalance = useCallback(async (): Promise<string> => {
    try {
      if (!walletState.connected || !walletState.address) {
        throw new Error('Wallet not connected');
      }

      switch (walletState.walletType) {
        case 'metamask': {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const balance = await provider.getBalance(walletState.address);
          const formattedBalance = ethers.utils.formatEther(balance);
          setWalletState(prev => ({ ...prev, balance: formattedBalance }));
          return formattedBalance;
        }

        case 'solana': {
          const connection = new Connection('https://api.mainnet-beta.solana.com');
          const balance = await connection.getBalance(new PublicKey(walletState.address));
          const formattedBalance = (balance / LAMPORTS_PER_SOL).toString();
          setWalletState(prev => ({ ...prev, balance: formattedBalance }));
          return formattedBalance;
        }

        case 'tron': {
          const balance = await window.tronWeb.trx.getBalance(walletState.address);
          const formattedBalance = (balance / 1e6).toString(); // Convert SUN to TRX
          setWalletState(prev => ({ ...prev, balance: formattedBalance }));
          return formattedBalance;
        }

        default:
          throw new Error('Unsupported wallet type');
      }
    } catch (error) {
      console.error('Failed to get balance', error);
      throw error;
    }
  }, [walletState.connected, walletState.address, walletState.walletType]);

  // Send transaction
  const sendTransaction = useCallback(async (to: string, amount: string): Promise<any> => {
    try {
      if (!walletState.connected || !walletState.address) {
        throw new Error('Wallet not connected');
      }

      switch (walletState.walletType) {
        case 'metamask': {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          
          // Create transaction
          const tx = {
            to,
            value: ethers.utils.parseEther(amount)
          };

          // Send transaction
          const txResponse = await signer.sendTransaction(tx);
          return txResponse;
        }

        case 'solana': {
          const connection = new Connection('https://api.mainnet-beta.solana.com');
          const transaction = new SolanaTransaction();
          
          // We would need to add instructions to the transaction
          // This is a simplified example
          // In a real app, you would use SystemProgram.transfer
          
          const signature = await window.solana.on('connect', async () => {
            // const { signature } = await window.solana.signAndSendTransaction(transaction);
            // await connection.confirmTransaction(signature);
          });
          return signature; // Move this line outside the on('connect') callback

        }

        case 'tron': {
          // Convert TRX to SUN
          const sunAmount = window.tronWeb.trx.getBalance(amount);
          
          // Send transaction
          const transaction = await window.tronWeb.trx.getBalance(to);
          return transaction;
        }

        default:
          throw new Error('Unsupported wallet type');
      }
    } catch (error) {
      console.error('Failed to send transaction', error);
      throw error;
    }
  }, [walletState.connected, walletState.address, walletState.walletType]);

  const walletActions: WalletActions = {
    connect,
    disconnect,
    getBalance,
    sendTransaction
  };

  return [walletState, walletActions];
};