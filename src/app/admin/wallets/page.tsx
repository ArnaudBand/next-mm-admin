'use client';
import React from 'react';
import {
  Box,
  SimpleGrid,
  Flex,
  Text,
  Button,
  Icon,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Alert,
  AlertIcon,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { FaEthereum, FaBitcoin, FaWallet } from 'react-icons/fa';
import { TbCurrencySolana } from 'react-icons/tb';
import { useWallet, WalletType } from 'contexts/walletContext';
import WalletCard from 'components/wallet/WalletCard';
import Card from 'components/card/Card';

export default function WalletPage() {
  const { connected, connectWallet, isLoading } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedWallet, setSelectedWallet] = React.useState<WalletType>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const metamaskBg = useColorModeValue('orange.50', 'rgba(246, 133, 27, 0.1)');
  const tronBg = useColorModeValue('red.50', 'rgba(255, 6, 10, 0.1)');
  const solanaBg = useColorModeValue('purple.50', 'rgba(153, 69, 255, 0.1)');
  
  // Handle wallet selection
  const handleWalletSelect = (type: WalletType) => {
    setSelectedWallet(type);
    setError(null);
    onOpen();
  };

  // Handle connect wallet
  const handleConnectWallet = async () => {
    if (!selectedWallet) return;
    
    try {
      setError(null);
      const success = await connectWallet(selectedWallet);
      if (success) {
        onClose();
      } else {
        setError(`Failed to connect to ${
          selectedWallet === 'metamask' ? 'MetaMask' :
          selectedWallet === 'tronlink' ? 'TronLink' :
          'Solana Wallet'
        }. Please try again.`);
      }
    } catch (err: unknown) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text
        mb="20px"
        color={textColor}
        fontSize="2xl"
        ms="24px"
        fontWeight="700"
      >
        Cryptocurrency Wallets
      </Text>

      {connected ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
          <WalletCard />
          <Card>
            <Text
              color={textColor}
              fontSize="lg"
              fontWeight="600"
              mb="20px"
            >
              Transaction History
            </Text>
            <Box p={4} textAlign="center">
              <Text color={textColorSecondary}>
                Transaction history will be displayed here in the future.
              </Text>
            </Box>
          </Card>
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb="20px">
          {/* MetaMask Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            role="group"
            cursor="pointer"
            onClick={() => handleWalletSelect('metamask')}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', shadow: 'md' }}
          >
            <Flex direction="column" align="center" justify="center" height="100%">
              <Box
                p={4}
                borderRadius="full"
                bg={metamaskBg}
                mb={4}
              >
                <Icon as={FaEthereum} w={12} h={12} color="#F6851B" />
              </Box>
              <Text fontSize="xl" fontWeight="600" color={textColor} mb={2}>
                MetaMask
              </Text>
              <Text fontSize="sm" color={textColorSecondary} textAlign="center" mb={4}>
                Connect to Ethereum network using MetaMask browser extension
              </Text>
              <Button
                colorScheme="orange"
                size="md"
                width="full"
                onClick={() => {
                  // e.stopPropagation();
                  handleWalletSelect('metamask');
                }}
              >
                Connect MetaMask
              </Button>
            </Flex>
          </Box>
          
          {/* TronLink Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            role="group"
            cursor="pointer"
            onClick={() => handleWalletSelect('tronlink')}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', shadow: 'md' }}
          >
            <Flex direction="column" align="center" justify="center" height="100%">
              <Box
                p={4}
                borderRadius="full"
                bg={tronBg}
                mb={4}
              >
                <Icon as={FaBitcoin} w={12} h={12} color="#FF060A" />
              </Box>
              <Text fontSize="xl" fontWeight="600" color={textColor} mb={2}>
                TronLink
              </Text>
              <Text fontSize="sm" color={textColorSecondary} textAlign="center" mb={4}>
                Connect to TRON network using TronLink browser extension
              </Text>
              <Button
                colorScheme="red"
                size="md"
                width="full"
                onClick={() => {
                  // e.stopPropagation();
                  handleWalletSelect('tronlink');
                }}
              >
                Connect TronLink
              </Button>
            </Flex>
          </Box>
          
          {/* Solana Wallet Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            role="group"
            cursor="pointer"
            onClick={() => handleWalletSelect('solana')}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', shadow: 'md' }}
          >
            <Flex direction="column" align="center" justify="center" height="100%">
              <Box
                p={4}
                borderRadius="full"
                bg={solanaBg}
                mb={4}
              >
                <Icon as={TbCurrencySolana} w={12} h={12} color="#9945FF" />
              </Box>
              <Text fontSize="xl" fontWeight="600" color={textColor} mb={2}>
                Solana Wallet
              </Text>
              <Text fontSize="sm" color={textColorSecondary} textAlign="center" mb={4}>
                Connect to Solana network using Phantom or other Solana wallets
              </Text>
              <Button
                colorScheme="purple"
                size="md"
                width="full"
                onClick={() => {
                  // e.stopPropagation();
                  handleWalletSelect('solana');
                }}
              >
                Connect Solana
              </Button>
            </Flex>
          </Box>
        </SimpleGrid>
      )}

      {/* Connect Wallet Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Connect {
              selectedWallet === 'metamask' ? 'MetaMask' :
              selectedWallet === 'tronlink' ? 'TronLink' :
              selectedWallet === 'solana' ? 'Solana Wallet' : 'Wallet'
            }
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text color={textColorSecondary}>
                {selectedWallet === 'metamask' && 
                  'You are about to connect your MetaMask wallet to this application. Make sure you have the MetaMask extension installed.'}
                {selectedWallet === 'tronlink' && 
                  'You are about to connect your TronLink wallet to this application. Make sure you have the TronLink extension installed.'}
                {selectedWallet === 'solana' && 
                  'You are about to connect your Solana wallet to this application. Make sure you have a Solana wallet like Phantom installed.'}
              </Text>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <Flex justify="center" align="center" py={4}>
                {selectedWallet === 'metamask' && <Icon as={FaEthereum} w={16} h={16} color="#F6851B" />}
                {selectedWallet === 'tronlink' && <Icon as={FaBitcoin} w={16} h={16} color="#FF060A" />}
                {selectedWallet === 'solana' && <Icon as={TbCurrencySolana} w={16} h={16} color="#9945FF" />}
              </Flex>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme={
                selectedWallet === 'metamask' ? 'orange' :
                selectedWallet === 'tronlink' ? 'red' :
                'purple'
              }
              mr={3} 
              onClick={handleConnectWallet}
              isLoading={isLoading}
              loadingText="Connecting"
              disabled={!selectedWallet}
            >
              Connect
            </Button>
            <Button onClick={onClose} variant="ghost">Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}