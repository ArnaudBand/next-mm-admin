'use client';

import { Box, Heading, VStack, Text } from '@chakra-ui/react';
import WalletConnectButton from 'components/wallet/WalletConnectButton';

export default function WalletPage() {
  return (
    <Box minH="100vh" marginTop={20} py={10} px={6}>
      <VStack spacing={8} align="center">
        <Heading size="lg">Connect Your Wallet</Heading>
        <Text fontSize="md" textAlign="center" maxW="400px">
          Use the button below to connect a compatible wallet (MetaMask, TronLink, or Phantom).
        </Text>
        <WalletConnectButton />
      </VStack>
    </Box>
  );
}
