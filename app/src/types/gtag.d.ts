// types/gtag.d.ts
// Type definitions for Google Analytics gtag.js API
declare interface Window {
    gtag?: (
        command: 'config' | 'event' | 'consent' | 'set',
        targetId: string,
        config?: Record<string, any> | undefined
    ) => void;
    dataLayer?: Array<Record<string, any>>;
}