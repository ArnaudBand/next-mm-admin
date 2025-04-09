"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Heading, 
  Alert, 
  AlertIcon, 
  VStack, 
  Text, 
  FormControl, 
  FormLabel, 
  Input, 
  Flex
} from '@chakra-ui/react';
import { WalletType } from 'types/wallet';
import { useWallet } from 'hooks/useWallet';
import { formatAddress } from 'utils/walletUtils';

const WalletConnect: React.FC = () => {
  const [walletState, { connect, disconnect, getBalance, sendTransaction }] = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handleConnect = async (walletType: WalletType) => {
    try {
      setIsLoading(true);
      setError(null);
      await connect(walletType);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await disconnect();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) {
      setError('Please provide recipient address and amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await sendTransaction(recipient, amount);
      setRecipient('');
      setAmount('');
      // Refresh balance after transaction
      await getBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" maxW="md" mx="auto" mt={8}>
      <Heading size="lg" mb={4}>Multi-Chain Wallet</Heading>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!walletState.connected ? (
        <VStack spacing={2}>
          <Button
            onClick={() => handleConnect('metamask')}
            isLoading={isLoading}
            colorScheme="orange"
          >
            Connect MetaMask
          </Button>
          <Button
            onClick={() => handleConnect('solana')}
            isLoading={isLoading}
            colorScheme="purple"
          >
            Connect Phantom (Solana)
          </Button>
          <Button
            onClick={() => handleConnect('tron')}
            isLoading={isLoading}
            colorScheme="red"
          >
            Connect TronLink
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4}>
          <Box bg="gray.100" p={3} borderRadius="md" width="100%">
            <Text>
              <Text as="span" fontWeight="bold">Wallet Type:</Text> {walletState.walletType}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">Address:</Text> {walletState.address && formatAddress(walletState.address, walletState.walletType!)}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">Balance:</Text> {walletState.balance} {walletState.walletType === 'metamask' ? 'ETH' : walletState.walletType === 'solana' ? 'SOL' : 'TRX'}
            </Text>
            {walletState.networkName && (
              <Text>
                <Text as="span" fontWeight="bold">Network:</Text> {walletState.networkName}
              </Text>
            )}
          </Box>

          <Box as="form" onSubmit={handleSendTransaction} width="100%">
            <VStack spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Recipient Address</FormLabel>
                <Input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient address"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Amount</FormLabel>
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount in ${walletState.walletType === 'metamask' ? 'ETH' : walletState.walletType === 'solana' ? 'SOL' : 'TRX'}`}
                />
              </FormControl>
              <Button
                type="submit"
                isLoading={isLoading}
                colorScheme="blue"
                width="100%"
              >
                Send
              </Button>
            </VStack>
          </Box>

          <Button
            onClick={handleDisconnect}
            isLoading={isLoading}
            colorScheme="gray"
            width="100%"
          >
            Disconnect
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default WalletConnect;