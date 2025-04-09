// src/utils/browserCompatibility.ts

export const checkBrowserCompatibility = () => {
  // Check if running in a browser environment
  if (typeof window === 'undefined') {
    return {
      isCompatible: false,
      message: 'Not running in browser environment',
    };
  }

  // Detect browser type
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isChrome = /chrome|chromium|crios/i.test(userAgent) && !/edg|opr\/|brave\//i.test(userAgent);
  const isFirefox = /firefox|fxios/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/chrome|chromium|crios/i.test(userAgent);
  const isEdge = /edg/i.test(userAgent);
  const isOpera = /opr\//i.test(userAgent);
  const isBrave = /brave/i.test(userAgent);

  // Detect operating system
  const isWindows = /win/i.test(navigator.platform);
  const isMac = /mac/i.test(navigator.platform);
  const isLinux = /linux/i.test(navigator.platform);
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);

  // Check if using a supported browser
  const supportedBrowser = isChrome || isFirefox || isSafari || isEdge || isOpera || isBrave;
  
  if (!supportedBrowser) {
    return {
      isCompatible: false,
      message: 'Unsupported browser detected. Please use Chrome, Firefox, Safari, Edge, Opera, or Brave.',
    };
  }

  // Check if using a supported OS
  const supportedOS = isWindows || isMac || isLinux || isAndroid || isIOS;
  
  if (!supportedOS) {
    return {
      isCompatible: false,
      message: 'Unsupported operating system detected. Please use Windows, macOS, Linux, Android, or iOS.',
    };
  }

  // Check for mobile device limitations (some wallet extensions may not work on mobile)
  const isMobile = isAndroid || isIOS;
  
  if (isMobile) {
    return {
      isCompatible: true,
      message: 'Mobile device detected. Some wallet features may be limited.',
      warnings: {
        isMobile: true,
      },
    };
  }

  return {
    isCompatible: true,
    message: 'Your browser and operating system are compatible with all wallet features.',
    browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : isOpera ? 'Opera' : isBrave ? 'Brave' : 'Unknown',
    os: isWindows ? 'Windows' : isMac ? 'macOS' : isLinux ? 'Linux' : isAndroid ? 'Android' : isIOS ? 'iOS' : 'Unknown',
  };
};

// Function to check if specific wallet is available
export const checkWalletExtensionAvailability = (walletType: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  switch (walletType) {
    case 'metamask':
      return !!(window.ethereum && window.ethereum.isMetaMask);
    case 'tronlink':
      return !!(window.tronWeb && window.tronLink);
    case 'solana':
      return !!(window.solana && window.solana.isPhantom);
    default:
      return false;
  }
};