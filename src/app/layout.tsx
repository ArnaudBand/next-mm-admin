import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import { WalletProvider } from 'contexts/walletContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id={'root'}>
        <AppWrappers>
          <WalletProvider>
            {children}
          </WalletProvider>
        </AppWrappers>
      </body>
    </html>
  );
}
