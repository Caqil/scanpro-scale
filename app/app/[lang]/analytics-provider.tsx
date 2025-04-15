// app/[lang]/analytics-provider.tsx
"use client";

import { ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logAnalyticsEvent, initializeAnalytics } from '@/lib/firebase';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // Intentionally use our complete analytics hook to get automatic tracking
  const analytics = useAnalytics();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeAnalytics().then(analyticsInstance => {
        if (analyticsInstance) {
          console.log('📊 Firebase Analytics initialized successfully');
        } else {
          console.warn('⚠️ Firebase Analytics initialization failed or unsupported');
        }
      });
    }
  }, []);

  // Identify page load timing
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      // Track page load performance
      window.addEventListener('load', () => {
        if (window.performance) {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const domLoadTime = perfData.domComplete - perfData.domLoading;
          
          logAnalyticsEvent('page_performance', {
            page_path: pathname,
            page_load_time: pageLoadTime,
            dom_load_time: domLoadTime,
            is_cached: document.visibilityState === 'visible'
          });
        }
      });
    }
  }, [pathname]);

  return <>{children}</>;
}