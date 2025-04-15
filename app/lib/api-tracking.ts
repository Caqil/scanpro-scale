// lib/api-tracking.ts
import { logAnalyticsEvent } from '@/lib/firebase';

// Enhanced fetch that includes analytics tracking
export const trackedFetch = async (
    url: string,
    options?: RequestInit,
    trackingInfo?: {
        operation?: string;
        toolName?: string;
        fileSize?: number;
        fileType?: string;
        outputFormat?: string;
    }
): Promise<Response> => {
    const startTime = performance.now();
    const operation = trackingInfo?.operation || getOperationFromUrl(url);

    try {
        // Log API request started
        logAnalyticsEvent('api_request_started', {
            url: url.split('?')[0], // Remove query parameters for cleaner tracking
            operation,
            tool_name: trackingInfo?.toolName,
            request_method: options?.method || 'GET',
            has_body: !!options?.body,
            timestamp: new Date().toISOString(),
            ...trackingInfo
        });

        // Make the actual API call
        const response = await fetch(url, options);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        // Clone the response so we can read the body but still return the original response
        const clonedResponse = response.clone();
        let responseBody;

        try {
            // Try to parse as JSON to extract success/error info
            responseBody = await clonedResponse.json();
        } catch (e) {
            // If not JSON, that's fine, we'll just track the status
            responseBody = { isJson: false };
        }

        // Log API response
        logAnalyticsEvent(
            response.ok ? 'api_request_success' : 'api_request_failed',
            {
                url: url.split('?')[0],
                operation,
                tool_name: trackingInfo?.toolName,
                status: response.status,
                status_text: response.statusText,
                response_time_ms: responseTime,
                success: response.ok,
                error_message: !response.ok ? (responseBody?.error || response.statusText) : undefined,
                ...trackingInfo
            }
        );

        return response;
    } catch (error) {
        // Log network errors or other exceptions
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        logAnalyticsEvent('api_request_error', {
            url: url.split('?')[0],
            operation,
            tool_name: trackingInfo?.toolName,
            error_type: 'network_error',
            error_message: error instanceof Error ? error.message : String(error),
            response_time_ms: responseTime,
            ...trackingInfo
        });

        throw error;
    }
};

// Extract operation name from URL
function getOperationFromUrl(url: string): string {
    const urlObj = new URL(url, window.location.origin);
    const pathParts = urlObj.pathname.split('/');

    // Handle API routes
    if (pathParts.includes('api')) {
        const apiIndex = pathParts.indexOf('api');
        if (apiIndex >= 0 && apiIndex < pathParts.length - 1) {
            // Return the resource type (like 'convert', 'compress', etc.)
            return pathParts[apiIndex + 1];
        }
    }

    // For non-API routes, return the last path segment
    const lastSegment = pathParts[pathParts.length - 1];
    return lastSegment || 'unknown';
}

// Helper for API response tracking when not using trackedFetch
export const trackApiResponse = (
    url: string,
    response: Response | { success?: boolean; error?: string },
    trackingInfo?: {
        operation?: string;
        toolName?: string;
        responseTime?: number;
    }
) => {
    const operation = trackingInfo?.operation || getOperationFromUrl(url);
    const isSuccess = 'status' in response ? response.ok : !!response.success;
    const errorMessage = 'status' in response ?
        response.statusText :
        (response.error || undefined);

    logAnalyticsEvent(
        isSuccess ? 'api_request_success' : 'api_request_failed',
        {
            url: url.split('?')[0],
            operation,
            tool_name: trackingInfo?.toolName,
            status: 'status' in response ? response.status : (isSuccess ? 200 : 400),
            success: isSuccess,
            error_message: !isSuccess ? errorMessage : undefined,
            response_time_ms: trackingInfo?.responseTime,
            timestamp: new Date().toISOString()
        }
    );
};

// Usage example:
/*
import { trackedFetch } from '@/lib/api-tracking';

// Use trackedFetch instead of regular fetch
const response = await trackedFetch('/api/convert', {
  method: 'POST',
  body: formData
}, {
  operation: 'conversion',
  toolName: 'pdf_to_word', 
  fileSize: file.size,
  fileType: 'pdf',
  outputFormat: 'docx'
});
*/