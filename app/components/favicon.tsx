import React from 'react';

/**
 * Favicon component that handles all the necessary head tags for favicons
 * across different platforms and devices
 */
export function Favicon() {
  return (
    <>
      {/* Standard favicons */}
      <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      
      {/* Apple Touch Icon */}
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      
      {/* Android/Chrome icons */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Safari Pinned Tab */}
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#0f172a" />
      
      {/* Microsoft Tiles */}
      <meta name="msapplication-TileColor" content="#0f172a" />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      
      {/* Theme color for browser address bar */}
      <meta name="theme-color" content="#0f172a" />
    </>
  );
}

export default Favicon;