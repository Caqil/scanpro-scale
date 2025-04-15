// lib/analytics.js
'use client'

import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'

export function Analytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID

    return (
        <>
            {gaId ? (
                <GoogleAnalytics gaId={gaId} />
            ) : (
                console.warn('Google Analytics ID is missing')
            )}
            {gtmId ? (
                <GoogleTagManager gtmId={gtmId} />
            ) : (
                console.warn('Google Tag Manager ID is missing')
            )}
        </>
    )
}