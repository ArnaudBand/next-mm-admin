'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Box,
  Text,
  useColorModeValue,
  Flex,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Badge,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react';
import { FaWallet, FaEthereum, FaBitcoin, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { TbCurrencySolana } from 'react-icons/tb';
import { useWallet, WalletType } from 'contexts/walletContext';

export default function WalletConnectButton() {
  const { 
    connected, 
    walletType, 
    address, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    isLoading,
    lastError,
    // setLastError,
    checkWalletAvailability
  } = useWallet();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(null);
  const [walletAvailability, setWalletAvailability] = useState<Record<WalletType, boolean>>({
    metamask: false,
    tronlink: false,
    solana: false,
    // null: false
  });

  // Check wallet availability on component mount
  useEffect(() => {
    const checkAvailability = () => {
      setWalletAvailability({
        metamask: checkWalletAvailability('metamask'),
        tronlink: checkWalletAvailability('tronlink'),
        solana: checkWalletAvailability('solana'),
        // null: false
      });
    };
    
    // Initial check
    checkAvailability();
    
    // Set up periodic checking
    const intervalId = setInterval(checkAvailability, 3000);
    
    return () => clearInterval(intervalId);
  }, [checkWalletAvailability]);

  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const buttonBg = useColorModeValue('white', 'navy.800');
  const buttonHoverBg = useColorModeValue('gray.100', 'navy.700');
  const menuBg = useColorModeValue('white', 'navy.800');
  const menuHoverBg = useColorModeValue('gray.100', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const metamaskColor = '#F6851B';
  const tronColor = '#FF060A';
  const solanaColor = '#9945FF';

  // Handle wallet selection
  const handleWalletSelect = (type: WalletType) => {
    console.log(`Selected wallet: ${type}`);
    console.log(`Wallet available: ${walletAvailability[type]}`);
    setSelectedWallet(type);
    onOpen();
  };

  // Handle connect wallet click
  const handleConnectWallet = async () => {
    if (!selectedWallet) return;
    
    try {
      // setError(null);
      console.log(`Attempting to connect to ${selectedWallet}`); // Add this log
      const success = await connectWallet(selectedWallet);
      console.log(`Connection result: ${success}`); // Add this log
      if (success) {
        onClose();
      } else {
        console.error(`Failed to connect to ${selectedWallet}`); // Add this log
        // setError(`Failed to connect to ${
        //   selectedWallet === 'metamask' ? 'MetaMask' :
        //   selectedWallet === 'tronlink' ? 'TronLink' :
        //   'Solana Wallet'
        // }. Please try again.`);
      }
    } catch (err) {
      console.error("Connection error:", err); // Add detailed error logging
      // setError('Failed to connect wallet. Please try again.');
    }
  };

  // Format address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get wallet icon and color based on type
  const getWalletIcon = (type: WalletType, size = 5) => {
    switch (type) {
      case 'metamask':
        return <Icon as={FaEthereum} w={size} h={size} color={metamaskColor} />;
      case 'tronlink':
        return <Icon as={FaBitcoin} w={size} h={size} color={tronColor} />;
      case 'solana':
        return <Icon as={TbCurrencySolana} w={size} h={size} color={solanaColor} />;
      default:
        return <Icon as={FaWallet} w={size} h={size} />;
    }
  };

  // Get wallet name based on type
  const getWalletName = (type: WalletType) => {
    switch (type) {
      case 'metamask':
        return 'MetaMask';
      case 'tronlink':
        return 'TronLink';
      case 'solana':
        return 'Solana';
      default:
        return 'Wallet';
    }
  };

  return (
    <>
      {connected ? (
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<FaChevronDown />}
            bg={buttonBg}
            color={textColor}
            fontSize="sm"
            fontWeight="500"
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            _hover={{ bg: buttonHoverBg }}
            h="38px"
          >
            <Flex align="center">
              {getWalletIcon(walletType)}
              <Text ml={2} display={{ base: 'none', md: 'block' }}>
                {formatAddress(address)}
              </Text>
            </Flex>
          </MenuButton>
          <MenuList bg={menuBg} borderColor={borderColor}>
            <Box px={4} py={2}>
              <Text fontSize="sm" fontWeight="500" mb={1}>
                Connected to {getWalletName(walletType)}
              </Text>
              <Text fontSize="sm" color="gray.500" mb={2} wordBreak="break-all">
                {address}
              </Text>
              <Badge colorScheme="green" mb={2}>
                {balance} {walletType === 'metamask' ? 'ETH' : walletType === 'tronlink' ? 'TRX' : 'SOL'}
              </Badge>
            </Box>
            <MenuItem
              onClick={disconnectWallet}
              _hover={{ bg: menuHoverBg }}
              fontSize="sm"
            >
              Disconnect Wallet
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<FaChevronDown />}
            bg={buttonBg}
            color={textColor}
            fontSize="sm"
            fontWeight="500"
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            _hover={{ bg: buttonHoverBg }}
            h="38px"
          >
            <Flex align="center">
              <Icon as={FaWallet} w={5} h={5} />
              <Text ml={2} display={{ base: 'none', md: 'block' }}>
                Connect Wallet
              </Text>
            </Flex>
          </MenuButton>
          <MenuList bg={menuBg} borderColor={borderColor}>
            <MenuItem
              icon={getWalletIcon('metamask')}
              onClick={() => handleWalletSelect('metamask')}
              _hover={{ bg: menuHoverBg }}
              fontSize="sm"
              isDisabled={!walletAvailability.metamask}
            >
              <Flex justify="space-between" width="100%" align="center">
                <Text>MetaMask</Text>
                {!walletAvailability.metamask && (
                  <Tooltip label="MetaMask not detected" placement="right">
                    <Icon as={FaExclamationTriangle} color="orange.500" ml={2} />
                  </Tooltip>
                )}
              </Flex>
            </MenuItem>
            <MenuItem
              icon={getWalletIcon('tronlink')}
              onClick={() => handleWalletSelect('tronlink')}
              _hover={{ bg: menuHoverBg }}
              fontSize="sm"
              isDisabled={!walletAvailability.tronlink}
            >
              <Flex justify="space-between" width="100%" align="center">
                <Text>TronLink</Text>
                {!walletAvailability.tronlink && (
                  <Tooltip label="TronLink not detected" placement="right">
                    <Icon as={FaExclamationTriangle} color="orange.500" ml={2} />
                  </Tooltip>
                )}
              </Flex>
            </MenuItem>
            <MenuItem
              icon={getWalletIcon('solana')}
              onClick={() => handleWalletSelect('solana')}
              _hover={{ bg: menuHoverBg }}
              fontSize="sm"
              isDisabled={!walletAvailability.solana}
            >
              <Flex justify="space-between" width="100%" align="center">
                <Text>Solana Wallet</Text>
                {!walletAvailability.solana && (
                  <Tooltip label="Solana Wallet not detected" placement="right">
                    <Icon as={FaExclamationTriangle} color="orange.500" ml={2} />
                  </Tooltip>
                )}
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}

      {/* Connect Wallet Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect {getWalletName(selectedWallet)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box textAlign="center" p={4}>
              {getWalletIcon(selectedWallet, 16)}
              <Text mt={4} mb={4}>
                Click below to connect to your {getWalletName(selectedWallet)} wallet.
                {!walletAvailability[selectedWallet] && (
                  <Text color="red.500" mt={2} fontSize="sm">
                    Warning: {getWalletName(selectedWallet)} extension not detected in your browser.
                  </Text>
                )}
              </Text>
              
              {/* Display errors if any */}
              {lastError && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">{lastError.type}</Text>
                    <Text fontSize="sm">{lastError.message}</Text>
                  </Box>
                </Alert>
              )}
              
              <Button
                colorScheme="blue"
                width="full"
                onClick={handleConnectWallet}
                isLoading={isLoading}
                loadingText="Connecting..."
              >
                Connect {getWalletName(selectedWallet)}
              </Button>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Text fontSize="xs" color="gray.500">
              {walletAvailability[selectedWallet] 
                ? `${getWalletName(selectedWallet)} is detected in your browser` 
                : `${getWalletName(selectedWallet)} is not detected. Please install it first.`}
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}