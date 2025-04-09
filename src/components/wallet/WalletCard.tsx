

import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Divider,
  useColorModeValue,
  IconButton,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import { FaEthereum, FaBitcoin, FaWallet, FaCopy, FaExternalLinkAlt, FaSignOutAlt } from 'react-icons/fa';
import { TbCurrencySolana } from 'react-icons/tb';
import { useWallet } from 'contexts/walletContext';
import Card from 'components/card/Card';

export default function WalletCard() {
  const { walletInfo, disconnectWallet } = useWallet();
  
  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const badgeBg = useColorModeValue('green.50', 'green.900');
  const badgeColor = useColorModeValue('green.700', 'green.300');
  const iconColor = useColorModeValue('brand.500', 'brand.400');

  // Wallet Icon based on type
  const WalletIcon = () => {
    if (walletInfo?.type === 'metamask') {
      return <Icon as={FaEthereum} w={8} h={8} color="#F6851B" />;
    } else if (walletInfo?.type === 'tronlink') {
      return <Icon as={FaBitcoin} w={8} h={8} color="#FF060A" />;
    } else if (walletInfo?.type === 'solana') {
      return <Icon as={TbCurrencySolana} w={8} h={8} color="#9945FF" />;
    }
    return <Icon as={FaWallet} w={8} h={8} color={iconColor} />;
  };

  // Copy address to clipboard
  const copyToClipboard = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      // You could add a toast notification here
    }
  };

  // Open explorer based on wallet type
  const openExplorer = () => {
    if (!walletInfo?.address) return;
    
    let url = '';
    if (walletInfo.type === 'metamask') {
      // Detect network and use appropriate explorer
      if (walletInfo.network.includes('Polygon')) {
        url = `https://polygonscan.com/address/${walletInfo.address}`;
      } else if (walletInfo.network.includes('Avalanche')) {
        url = `https://snowtrace.io/address/${walletInfo.address}`;
      } else {
        // Default to Etherscan
        url = `https://etherscan.io/address/${walletInfo.address}`;
      }
    } else if (walletInfo.type === 'tronlink') {
      url = `https://tronscan.org/#/address/${walletInfo.address}`;
    } else if (walletInfo.type === 'solana') {
      url = `https://explorer.solana.com/address/${walletInfo.address}`;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card>
      <Flex direction="column" p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Flex align="center">
            <Box mr={3}>
              <WalletIcon />
            </Box>
            <Box>
              <Text color={textColor} fontSize="lg" fontWeight="600">
                {walletInfo?.type === 'metamask' ? 'MetaMask' : 
                  walletInfo?.type === 'tronlink' ? 'TronLink' : 
                  walletInfo?.type === 'solana' ? 'Solana Wallet' : 'Wallet'}
              </Text>
              <Text color={textColorSecondary} fontSize="sm">
                {walletInfo?.network}
              </Text>
            </Box>
          </Flex>
          <Badge bg={badgeBg} color={badgeColor} fontSize="sm" p={1} borderRadius="md">
            Connected
          </Badge>
        </Flex>
        
        <Divider my={3} />
        
        <Flex direction="column" mb={4}>
          <Text color={textColorSecondary} fontSize="sm" mb={1}>
            Address
          </Text>
          <Flex align="center" mb={3}>
            <Text color={textColor} fontSize="md" fontWeight="500" mr={2}>
              {formatAddress(walletInfo?.address || '')}
            </Text>
            <HStack spacing={1}>
              <Tooltip label="Copy address">
                <IconButton
                  aria-label="Copy address"
                  icon={<FaCopy />}
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                />
              </Tooltip>
              <Tooltip label="View in explorer">
                <IconButton
                  aria-label="View in explorer"
                  icon={<FaExternalLinkAlt />}
                  size="sm"
                  variant="ghost"
                  onClick={openExplorer}
                />
              </Tooltip>
            </HStack>
          </Flex>
          
          <Text color={textColorSecondary} fontSize="sm" mb={1}>
            Balance
          </Text>
          <Text color={textColor} fontSize="lg" fontWeight="600" mb={4}>
            {walletInfo?.balance || '0'}
          </Text>
        </Flex>
        
        <Box mt="auto">
          <Button 
            leftIcon={<FaSignOutAlt />}
            colorScheme="red"
            variant="outline"
            size="md"
            onClick={disconnectWallet}
            width="full"
          >
            Disconnect Wallet
          </Button>
        </Box>
      </Flex>
    </Card>
  );
}