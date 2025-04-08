'use client';
import {
  Box,
  Flex,
  Text,
  Icon,
  Button,
  useColorModeValue,
  Stack,
  Badge,
} from '@chakra-ui/react';
import { FaEthereum, FaBitcoin } from 'react-icons/fa';
import { TbCurrencySolana } from 'react-icons/tb';
import { useWallet, WalletType } from 'contexts/walletContext';

export default function WalletCard() {
  const { connected, walletType, address, balance, disconnectWallet } = useWallet();
  
  // Colors
  const cardBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('navy.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const metamaskColor = '#F6851B';
  const tronColor = '#FF060A';
  const solanaColor = '#9945FF';

  // Get wallet icon and color based on type
  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'metamask':
        return { icon: FaEthereum, color: metamaskColor, text: 'MetaMask', symbol: 'ETH' };
      case 'tronlink':
        return { icon: FaBitcoin, color: tronColor, text: 'TronLink', symbol: 'TRX' };
      case 'solana':
        return { icon: TbCurrencySolana, color: solanaColor, text: 'Solana', symbol: 'SOL' };
      default:
        return { icon: FaEthereum, color: 'gray.500', text: 'Wallet', symbol: '' };
    }
  };

  // Format address for display
  const formatAddressLong = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  if (!connected) {
    return (
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        height="100%"
      >
        <Flex direction="column" justify="center" align="center" height="100%" gap={4}>
          <Text fontSize="lg" fontWeight="600" color={textColor}>
            No Wallet Connected
          </Text>
          <Text fontSize="sm" color={secondaryTextColor} textAlign="center">
            Connect a wallet to view your crypto balances and perform transactions.
          </Text>
        </Flex>
      </Box>
    );
  }

  const walletInfo = getWalletIcon(walletType);

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
    >
      <Flex mb={4} justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="600" color={textColor}>
          Wallet Details
        </Text>
        <Icon as={walletInfo.icon} w={7} h={7} color={walletInfo.color} />
      </Flex>
      
      <Stack spacing={4}>
        <Box>
          <Text fontSize="sm" color={secondaryTextColor}>
            Wallet Type
          </Text>
          <Badge colorScheme={
            walletType === 'metamask' ? 'orange' : 
            walletType === 'tronlink' ? 'red' : 'purple'
          }>
            {walletInfo.text}
          </Badge>
        </Box>
        
        <Box>
          <Text fontSize="sm" color={secondaryTextColor}>
            Address
          </Text>
          <Text fontSize="sm" fontWeight="500">
            {formatAddressLong(address)}
          </Text>
        </Box>
        
        <Box>
          <Text fontSize="sm" color={secondaryTextColor}>
            Balance
          </Text>
          <Text fontSize="xl" fontWeight="700">
            {balance} {walletInfo.symbol}
          </Text>
        </Box>
        
        <Button
          mt={2}
          colorScheme="red"
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
        >
          Disconnect Wallet
        </Button>
      </Stack>
    </Box>
  );
}