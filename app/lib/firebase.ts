// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics if browser supports it
let analytics: any = null;

const initializeAnalytics = async () => {
    if (await isSupported()) {
        analytics = getAnalytics(app);
        return analytics;
    }
    return null;
};

// Log event helper function
const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (analytics) {
        logEvent(analytics, eventName, eventParams);
    } else if (typeof window !== 'undefined') {
        // Initialize analytics if it's not already initialized
        initializeAnalytics().then((analyticsInstance) => {
            if (analyticsInstance) {
                logEvent(analyticsInstance, eventName, eventParams);
            }
        });
    }
};

// Initialize analytics on client side
if (typeof window !== 'undefined') {
    initializeAnalytics();
}

export { app, analytics, initializeAnalytics, logAnalyticsEvent };