// lib/analytics.tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Get Analytics IDs from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Analytics component that handles all tracking scripts
 * This component uses next/script with appropriate strategies
 * to ensure it doesn't block rendering or hydration
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Only run in production and when the components have been hydrated
    if (process.env.NODE_ENV !== 'production' || !pathname) return;
    
    // Track page views
    const handleRouteChange = (url: string) => {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: url,
          page_title: document.title,
        });
      }
    };
    
    // Construct full URL
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    handleRouteChange(url);
    
  }, [pathname, searchParams]);
  
  // Don't render any scripts in development
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }
  
  return (
    <>
      {/* Google Analytics 4 - using lazyOnload for minimal impact */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="lazyOnload"
          />
          <Script
            id="gtag-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  transport_type: 'beacon',
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager - using afterInteractive */}
      {GTM_ID && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
                <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
              `,
            }}
          />
        </>
      )}
    </>
  );
}