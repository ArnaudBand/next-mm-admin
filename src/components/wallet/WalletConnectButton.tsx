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
  Link,
  HStack,
  VStack,
  Avatar,
  AvatarBadge,
  Divider,
  useToast,
  Heading,
  IconButton,
} from '@chakra-ui/react';
import { 
  FaWallet, 
  FaEthereum, 
  FaBitcoin, 
  FaChevronDown, 
  FaExclamationTriangle, 
  FaDownload,
  FaCopy,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { TbCurrencySolana } from 'react-icons/tb';
import { useWallet, WalletType } from 'contexts/walletContext';
import { checkBrowserCompatibility, checkWalletExtensionAvailability } from 'utils/browserCompatibility';

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
    checkWalletAvailability
  } = useWallet();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(null);
  const [walletAvailability, setWalletAvailability] = useState<Record<WalletType, boolean>>({
    metamask: false,
    tronlink: false,
    solana: false,
  });
  const [compatibility, setCompatibility] = useState<any>(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const toast = useToast();

  // Set isBrowser state on component mount
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Check compatibility and wallet availability on component mount
  useEffect(() => {
    if (isBrowser) {
      const checkCompat = checkBrowserCompatibility();
      setCompatibility(checkCompat);
      
      const checkAvailability = () => {
        setWalletAvailability({
          metamask: checkWalletExtensionAvailability('metamask'),
          tronlink: checkWalletExtensionAvailability('tronlink'),
          solana: checkWalletExtensionAvailability('solana'),
        });
      };
      
      // Initial check
      checkAvailability();
      
      // Set up periodic checking
      const intervalId = setInterval(checkAvailability, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [checkWalletAvailability, isBrowser]);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => setCopiedAddress(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedAddress]);

  // Enhanced color scheme with better contrast and visual hierarchy
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const buttonBg = useColorModeValue('white', 'gray.800');
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.700');
  const buttonActiveBg = useColorModeValue('gray.100', 'gray.600');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuHoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const glowColor = useColorModeValue('rgba(66, 153, 225, 0.6)', 'rgba(99, 179, 237, 0.6)');
  
  // Wallet brand colors
  const metamaskColor = '#F6851B';
  const tronColor = '#FF060A';
  const solanaColor = '#9945FF';
  
  // Badge colors
  const successColor = useColorModeValue('green.500', 'green.300');
  const badgeBgColor = useColorModeValue('green.50', 'green.900');
  const iconBgColor = useColorModeValue('gray.50', 'gray.700');

  // Get download links for wallet extensions
  const getWalletDownloadLink = (type: WalletType) => {
    // Check if we're in a browser environment
    if (!isBrowser) {
      return '#';
    }
    
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    
    if (type === 'metamask') {
      return isFirefox 
        ? 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/'
        : 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';
    } else if (type === 'tronlink') {
      return isFirefox
        ? 'https://addons.mozilla.org/en-US/firefox/addon/tronlink/'
        : 'https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec';
    } else if (type === 'solana') {
      return isFirefox
        ? 'https://addons.mozilla.org/en-US/firefox/addon/phantom-app/'
        : 'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa';
    }
    return '#';
  };

  // Handle wallet selection - redirects to download if not available
  const handleWalletSelect = (type: WalletType) => {
    console.log(`Selected wallet: ${type}`);
    console.log(`Wallet available: ${walletAvailability[type]}`);
    
    if (!walletAvailability[type]) {
      // Redirect to download page if wallet is not available
      window.open(getWalletDownloadLink(type), '_blank');
      return;
    }
    
    // Otherwise, proceed with standard wallet selection
    setSelectedWallet(type);
    onOpen();
  };

  // Handle connect wallet click
  const handleConnectWallet = async () => {
    if (!selectedWallet) {
      console.error('No wallet selected');
      return;
    };
    
    try {
      console.log(`Attempting to connect to ${selectedWallet}`);
      const success = await connectWallet(selectedWallet);
      console.log(`Connection result: ${success}`);
      if (success) {
        onClose();
        toast({
          title: "Wallet connected",
          description: `Successfully connected to ${getWalletName(selectedWallet)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      } else {
        console.error(`Failed to connect to ${selectedWallet}`);
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  // Format address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  // Get wallet icon with enhanced styling
  const getWalletIcon = (type: WalletType, size = 5) => {
    switch (type) {
      case 'metamask':
        return (
          <Box borderRadius="full" p={1} bg={`rgba(246, 133, 27, 0.1)`} display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaEthereum} w={size} h={size} color={metamaskColor} />
          </Box>
        );
      case 'tronlink':
        return (
          <Box borderRadius="full" p={1} bg={`rgba(255, 6, 10, 0.1)`} display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaBitcoin} w={size} h={size} color={tronColor} />
          </Box>
        );
      case 'solana':
        return (
          <Box borderRadius="full" p={1} bg={`rgba(153, 69, 255, 0.1)`} display="flex" alignItems="center" justifyContent="center">
            <Icon as={TbCurrencySolana} w={size} h={size} color={solanaColor} />
          </Box>
        );
      default:
        return (
          <Box borderRadius="full" p={1} bg={iconBgColor} display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaWallet} w={size} h={size} />
          </Box>
        );
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
        return 'Phantom (Solana)';
      default:
        return 'Wallet';
    }
  };

  // If not in browser, render nothing or a placeholder
  if (!isBrowser) {
    return null; // Or return a simple placeholder component
  }

  return (
    <>
      {connected ? (
        <Menu placement="bottom-end" autoSelect={false}>
          <Tooltip 
            label="Connected wallet" 
            placement="bottom" 
            hasArrow 
            openDelay={500}
          >
            <MenuButton
              as={Button}
              rightIcon={<FaChevronDown />}
              bg={buttonBg}
              color={textColor}
              fontSize="sm"
              fontWeight="600"
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              _hover={{ 
                bg: buttonHoverBg, 
                borderColor: "blue.400",
                boxShadow: `0 0 0 3px ${glowColor}`
              }}
              _active={{ bg: buttonActiveBg }}
              h="40px"
              px={4}
              transition="all 0.2s"
              boxShadow="sm"
            >
              <Flex align="center">
                <Avatar 
                  size="xs" 
                  bg={iconBgColor} 
                  icon={getWalletIcon(walletType, 3)}
                  borderRadius="full"
                >
                  <AvatarBadge boxSize="0.9em" bg="green.500" borderColor="white" />
                </Avatar>
                <Text ml={2} fontWeight="600">{formatAddress(address)}</Text>
                {balance && (
                  <Badge 
                    ml={2} 
                    colorScheme="green" 
                    fontSize="xs" 
                    px={2} 
                    py={0.5} 
                    borderRadius="full"
                    bg={badgeBgColor}
                    color={successColor}
                  >
                    {balance}
                  </Badge>
                )}
              </Flex>
            </MenuButton>
          </Tooltip>
          <MenuList 
            bg={menuBg} 
            borderColor={borderColor} 
            boxShadow="lg" 
            borderRadius="xl" 
            p={2}
            minW="260px"
            overflow="hidden"
          >
            <Box px={3} py={2}>
              <Text fontSize="xs" color={secondaryTextColor} mb={1}>CONNECTED WALLET</Text>
              <Flex align="center" mb={2}>
                {getWalletIcon(walletType, 5)}
                <Text ml={2} fontWeight="bold">{getWalletName(walletType)}</Text>
              </Flex>
              <Divider mb={2} />
              
              <Box py={1}>
                <Text fontSize="xs" color={secondaryTextColor} mb={1}>YOUR ADDRESS</Text>
                <Flex justify="space-between" align="center">
                  <Text isTruncated maxW="160px" fontSize="sm">{address}</Text>
                  <HStack spacing={1}>
                    <Tooltip 
                      label={copiedAddress ? "Copied!" : "Copy address"} 
                      placement="top" 
                      hasArrow
                    >
                      <IconButton
                        aria-label="Copy address"
                        icon={copiedAddress ? <FaCheckCircle /> : <FaCopy />}
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(address as string)}
                      />
                    </Tooltip>
                    <Tooltip label="View on explorer" placement="top" hasArrow>
                      <IconButton
                        aria-label="View on explorer"
                        icon={<FaExternalLinkAlt />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </Box>
            </Box>
            
            <Divider my={2} />
            
            <MenuItem 
              icon={<Icon as={FaSignOutAlt} color="red.500" />}
              _hover={{ bg: menuHoverBg }}
              onClick={disconnectWallet}
              borderRadius="md"
              fontWeight="medium"
            >
              Disconnect Wallet
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Menu placement="bottom-end" autoSelect={false}>
          <Tooltip 
            label="Connect your wallet" 
            placement="bottom" 
            hasArrow 
            openDelay={500}
          >
            <MenuButton
              as={Button}
              rightIcon={<FaChevronDown />}
              leftIcon={<Icon as={FaWallet} />}
              bg={buttonBg}
              color={textColor}
              fontSize="sm"
              fontWeight="600"
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              _hover={{ 
                bg: buttonHoverBg, 
                borderColor: "blue.400",
                boxShadow: `0 0 0 3px ${glowColor}`
              }}
              _active={{ bg: buttonActiveBg }}
              h="40px"
              isLoading={isLoading}
              loadingText="Connecting"
              boxShadow="sm"
              transition="all 0.2s"
            >
              Connect Wallet
            </MenuButton>
          </Tooltip>
          <MenuList 
            bg={menuBg} 
            borderColor={borderColor} 
            boxShadow="lg" 
            borderRadius="xl"
            p={2}
            minW="280px"
            overflow="hidden"
          >
            <Text px={3} pt={2} pb={3} fontSize="sm" fontWeight="bold" color={textColor}>
              Select Wallet Provider
            </Text>
            
            {compatibility && !compatibility.isCompatible && (
              <Box p={3}>
                <Alert 
                  status="warning" 
                  borderRadius="lg"
                  variant="left-accent"
                  borderLeftWidth={4}
                >
                  <AlertIcon as={FaExclamationTriangle} />
                  <Text fontSize="sm">{compatibility.message}</Text>
                </Alert>
              </Box>
            )}
            
            {compatibility && compatibility.warnings && compatibility.warnings.isMobile && (
              <Box p={3}>
                <Alert 
                  status="info" 
                  borderRadius="lg"
                  variant="left-accent"
                  borderLeftWidth={4}
                >
                  <AlertIcon />
                  <Text fontSize="sm">{compatibility.message}</Text>
                </Alert>
              </Box>
            )}
            
            <Divider my={2} />
            
            <MenuItem
              icon={getWalletIcon('metamask', 5)}
              onClick={() => handleWalletSelect('metamask')}
              _hover={{ bg: menuHoverBg }}
              borderRadius="md"
              h="54px"
              transition="all 0.2s"
              mb={1}
            >
              <Flex justify="space-between" width="100%" align="center">
                <Text fontWeight="medium">MetaMask</Text>
                {!walletAvailability.metamask && (
                  <HStack color="blue.500" fontSize="xs" spacing={1}>
                    <Icon as={FaDownload} />
                    <Text>Install</Text>
                  </HStack>
                )}
              </Flex>
            </MenuItem>
            
            <MenuItem
              icon={getWalletIcon('tronlink', 5)}
              onClick={() => handleWalletSelect('tronlink')}
              _hover={{ bg: menuHoverBg }}
              borderRadius="md"
              h="54px"
              transition="all 0.2s"
              mb={1}
            >
              <Flex justify="space-between" width="100%" align="center">
                <Text fontWeight="medium">TronLink</Text>
                {!walletAvailability.tronlink && (
                  <HStack color="blue.500" fontSize="xs" spacing={1}>
                    <Icon as={FaDownload} />
                    <Text>Install</Text>
                  </HStack>
                )}
              </Flex>
            </MenuItem>
            
            <MenuItem
              icon={getWalletIcon('solana', 5)}
              onClick={() => handleWalletSelect('solana')}
              _hover={{ bg: menuHoverBg }}
              borderRadius="md"
              h="54px"
              transition="all 0.2s"
            >
              <Flex justify="space-between" width="100%" align="center">
                <Text fontWeight="medium">Phantom (Solana)</Text>
                {!walletAvailability.solana && (
                  <HStack color="blue.500" fontSize="xs" spacing={1}>
                    <Icon as={FaDownload} />
                    <Text>Install</Text>
                  </HStack>
                )}
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      )}

      {/* Enhanced Connection Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent 
          bg={menuBg} 
          borderRadius="2xl" 
          boxShadow="xl"
          overflow="hidden"
          maxW="400px"
        >
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4}>
            <Flex align="center">
              <Box mr={4} p={2} borderRadius="xl" bg={`rgba(66, 153, 225, 0.1)`}>
                {selectedWallet && getWalletIcon(selectedWallet, 8)}
              </Box>
              <VStack align="flex-start" spacing={0}>
                <Heading size="md">
                  Connect {selectedWallet && getWalletName(selectedWallet)}
                </Heading>
                <Text fontSize="sm" color={secondaryTextColor}>
                  Connect securely to continue
                </Text>
              </VStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton 
            size="md" 
            top={4} 
            right={4} 
            borderRadius="full"
            _hover={{ bg: buttonHoverBg }}
          />
          
          <ModalBody py={6}>
            {lastError && (
              <Alert 
                status="error" 
                mb={6} 
                borderRadius="xl"
                variant="left-accent"
                borderLeftWidth={4}
              >
                <AlertIcon />
                <Box flex="1">
                  <Text fontWeight="bold">{lastError.type}</Text>
                  <Text fontSize="sm">{lastError.message}</Text>
                </Box>
              </Alert>
            )}
            
            <VStack spacing={5} align="stretch">
              <Text>
                Please click &quot;Connect&quot; to connect your {selectedWallet && getWalletName(selectedWallet)} wallet.
                Make sure your wallet is unlocked.
              </Text>
              
              <Box 
                borderRadius="xl" 
                bg={`rgba(66, 153, 225, 0.1)`} 
                p={8} 
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {selectedWallet && getWalletIcon(selectedWallet, 12)}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4}>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onClose}
              borderRadius="lg"
              color={secondaryTextColor}
              fontWeight="medium"
              _hover={{ bg: buttonHoverBg }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleConnectWallet}
              isLoading={isLoading}
              loadingText="Connecting"
              borderRadius="lg"
              px={6}
              _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
            >
              Connect
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}