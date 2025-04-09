"use client";

import { Box, Container, Heading, Text } from '@chakra-ui/react';
import WalletConnect from 'components/wallet/WalletConnect';
import { WalletProvider } from 'contexts/walletContext';

const WalletPage = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container mt={16} as="main" maxW="container.xl" px={4} py={8}>
        <Heading as="h1" size="xl" textAlign="center" mb={8}>
          Web3 Wallet Integration
        </Heading>
        
        {/* Added bigger margin top (mt={16} is equivalent to mt-16 in Tailwind) */}
        <Box>
          <WalletProvider>
            <WalletConnect />
          </WalletProvider>
        </Box>
      </Container>
      
      <Box as="footer" textAlign="center" py={4} color="gray.500">
        <Text>© {new Date().getFullYear()} Web3 Wallet Integration</Text>
      </Box>
    </Box>
  );
};

export default WalletPage;