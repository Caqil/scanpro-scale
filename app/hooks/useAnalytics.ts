// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logAnalyticsEvent } from '@/lib/firebase';

// Create standard event names
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  FILE_UPLOAD: 'file_upload',
  CONVERSION_STARTED: 'conversion_started',
  CONVERSION_COMPLETED: 'conversion_completed',
  CONVERSION_ERROR: 'conversion_error',
  TOOL_USED: 'tool_used',
  SUBSCRIPTION_VIEWED: 'subscription_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_COMPLETED: 'subscription_completed',
  LOGIN: 'login',
  SIGNUP: 'signup',
  SEARCH: 'search',
  DOWNLOAD: 'download',
  SHARE: 'share',
  ERROR: 'error',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  FILE_SELECTED: 'file_selected',
  NAVIGATION: 'navigation',
};

// Tools mapping to detect tool usage automatically from URL
const TOOL_URL_MAPPING: Record<string, string> = {
  '/convert/pdf-to-docx': 'pdf_to_word',
  '/convert/pdf-to-xlsx': 'pdf_to_excel',
  '/convert/pdf-to-jpg': 'pdf_to_jpg',
  '/convert/docx-to-pdf': 'word_to_pdf',
  '/compress-pdf': 'compress_pdf',
  '/merge-pdf': 'merge_pdf',
  '/split-pdf': 'split_pdf',
  '/protect-pdf': 'protect_pdf',
  '/unlock-pdf': 'unlock_pdf',
  '/sign': 'sign_pdf',
  '/ocr': 'pdf_ocr',
  '/repair': 'repair_pdf',
  '/watermark-pdf': 'watermark_pdf',
  '/edit': 'edit_pdf',
};

export const useAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Automatically track page views and tool visits
  useEffect(() => {
    if (pathname) {
      // Track page view
      logAnalyticsEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
        page_path: pathname,
        page_search: searchParams ? searchParams.toString() : '',
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof document !== 'undefined' ? document.title : '',
      });

      // Automatically detect tool usage from URL
      for (const [urlPath, toolName] of Object.entries(TOOL_URL_MAPPING)) {
        if (pathname.includes(urlPath)) {
          logAnalyticsEvent(ANALYTICS_EVENTS.TOOL_USED, {
            tool_name: toolName,
            source: 'url_navigation',
          });
          break;
        }
      }

      // Detect subscription page views
      if (pathname.includes('/pricing') || pathname.includes('/subscription')) {
        logAnalyticsEvent(ANALYTICS_EVENTS.SUBSCRIPTION_VIEWED, {
          source: 'url_navigation',
        });
      }
    }
  }, [pathname, searchParams]);

  // Set up automatic event listeners for common interactions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Helper to get element info
    const getElementInfo = (element: HTMLElement): Record<string, any> => {
      const result: Record<string, any> = {};

      // Get element text content (limited to prevent large payloads)
      if (element.textContent) {
        result.element_text = element.textContent.trim().substring(0, 50);
      }

      // Get element ID
      if (element.id) {
        result.element_id = element.id;
      }

      // Get element class names
      if (element.className && typeof element.className === 'string') {
        result.element_class = element.className;
      }

      // Get element type if applicable
      if ('type' in element && element.type) {
        result.element_type = element.type;
      }

      // Get element name if applicable
      if ('name' in element && element.name) {
        result.element_name = element.name;
      }

      // Get href for links
      if (element.tagName === 'A' && 'href' in element) {
        const href = (element as HTMLAnchorElement).href;
        if (href) {
          result.link_url = href;
        }
      }

      // Get closest identifiable parent
      let parent = element.parentElement;
      let depth = 0;
      while (parent && depth < 3) {
        if (parent.id) {
          result.parent_id = parent.id;
          break;
        }
        if (parent.className && typeof parent.className === 'string') {
          result.parent_class = parent.className;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }

      return result;
    };

    // Track button clicks
    const handleButtonClick = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      let button: HTMLElement | null = null;

      // Find button element
      if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
        button = element;
      } else {
        button = element.closest('button') || element.closest('[role="button"]');
      }

      if (button) {
        // Get various properties to identify the button
        const elementInfo = getElementInfo(button);

        // Look for recognizable actions
        let actionType = 'generic_button_click';

        // Detect action by button text
        const buttonText = elementInfo.element_text?.toLowerCase() || '';
        if (buttonText.includes('download')) actionType = 'download';
        else if (buttonText.includes('upload')) actionType = 'upload';
        else if (buttonText.includes('convert')) actionType = 'conversion';
        else if (buttonText.includes('sign in') || buttonText.includes('login')) actionType = 'login';
        else if (buttonText.includes('sign up') || buttonText.includes('register')) actionType = 'signup';
        else if (buttonText.includes('submit')) actionType = 'form_submit';

        // Log event
        logAnalyticsEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
          action_type: actionType,
          page_path: pathname,
          ...elementInfo
        });
      }
    };

    // Track form submissions
    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      if (!form) return;

      // Get form info
      const elementInfo = getElementInfo(form);

      // Try to identify the form purpose
      let formType = 'generic_form';

      // Check for recognizable form types
      if (form.id) {
        const formId = form.id.toLowerCase();
        if (formId.includes('login') || formId.includes('signin')) formType = 'login';
        else if (formId.includes('register') || formId.includes('signup')) formType = 'signup';
        else if (formId.includes('contact')) formType = 'contact';
        else if (formId.includes('search')) formType = 'search';
        else if (formId.includes('convert')) formType = 'conversion';
      }

      // Check inputs for clues
      const inputs = Array.from(form.querySelectorAll('input'));
      const hasPasswordField = inputs.some(input => input.type === 'password');
      const hasEmailField = inputs.some(input => input.type === 'email' || input.name?.includes('email'));
      const hasFileField = inputs.some(input => input.type === 'file');

      if (hasPasswordField && hasEmailField) {
        if (form.action?.includes('login') || form.action?.includes('signin')) {
          formType = 'login';
        } else {
          formType = 'signup';
        }
      } else if (hasFileField) {
        formType = 'file_upload';
      }

      // Log event
      logAnalyticsEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
        form_type: formType,
        has_password: hasPasswordField,
        has_email: hasEmailField,
        has_file: hasFileField,
        page_path: pathname,
        ...elementInfo
      });
    };

    // Track file selection
    const handleFileSelection = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.type !== 'file' || !input.files || !input.files.length) return;

      const files = Array.from(input.files);
      const fileTypes = files.map(file => file.type || file.name.split('.').pop() || 'unknown');
      const totalSize = files.reduce((total, file) => total + file.size, 0);

      // Get element info
      const elementInfo = getElementInfo(input);

      // Log event
      logAnalyticsEvent(ANALYTICS_EVENTS.FILE_SELECTED, {
        file_count: files.length,
        file_types: fileTypes,
        total_size: totalSize,
        average_size: Math.round(totalSize / files.length),
        page_path: pathname,
        ...elementInfo
      });
    };

    // Track navigation (both link clicks and history changes)
    const handleNavigation = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      const link = element.tagName === 'A' ? element : element.closest('a');

      if (link && 'href' in link) {
        const href = (link as HTMLAnchorElement).href;
        if (!href || href.startsWith('javascript:') || href === '#') return;

        // Get link info
        const elementInfo = getElementInfo(link as HTMLElement);

        // Try to identify the navigation purpose
        let navType = 'internal';
        if (href.includes(window.location.hostname)) {
          navType = 'internal';

          // Check if navigation is to a tool
          for (const [urlPath, toolName] of Object.entries(TOOL_URL_MAPPING)) {
            if (href.includes(urlPath)) {
              // Record this as a tool selection
              logAnalyticsEvent(ANALYTICS_EVENTS.TOOL_USED, {
                tool_name: toolName,
                source: 'link_navigation',
              });
              break;
            }
          }
        } else {
          navType = 'external';
        }

        // Log event
        logAnalyticsEvent(ANALYTICS_EVENTS.NAVIGATION, {
          navigation_type: navType,
          target_url: href,
          page_path: pathname,
          ...elementInfo
        });
      }
    };

    // Setup global error tracking
    const handleGlobalError = (event: ErrorEvent) => {
      logAnalyticsEvent(ANALYTICS_EVENTS.ERROR, {
        error_type: 'javascript',
        error_message: event.message,
        error_file: event.filename,
        error_line: event.lineno,
        error_column: event.colno,
        page_path: pathname,
      });
    };

    // Add event listeners
    document.addEventListener('click', handleButtonClick, { passive: true });
    document.addEventListener('submit', handleFormSubmit, { passive: true });
    document.addEventListener('change', handleFileSelection, { passive: true });
    document.addEventListener('click', handleNavigation, { passive: true });
    window.addEventListener('error', handleGlobalError, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('click', handleButtonClick);
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('change', handleFileSelection);
      document.removeEventListener('click', handleNavigation);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [pathname]);

  // Function to track tool usage
  const trackToolUsage = (toolName: string, additionalParams?: Record<string, any>) => {
    logAnalyticsEvent(ANALYTICS_EVENTS.TOOL_USED, {
      tool_name: toolName,
      source: 'manual_tracking',
      ...additionalParams,
    });
  };

  // Function to track file operations
  const trackFileOperation = (
    operationType: 'upload' | 'download' | 'conversion' | 'compression' | 'merge' | 'split' | 'protect' | 'unlock',
    fileDetails: {
      fileType?: string;
      fileSize?: number;
      outputFormat?: string;
      success?: boolean;
      errorMessage?: string;
    }
  ) => {
    let eventName;

    switch (operationType) {
      case 'upload':
        eventName = ANALYTICS_EVENTS.FILE_UPLOAD;
        break;
      case 'download':
        eventName = ANALYTICS_EVENTS.DOWNLOAD;
        break;
      case 'conversion':
        eventName = fileDetails.success
          ? ANALYTICS_EVENTS.CONVERSION_COMPLETED
          : ANALYTICS_EVENTS.CONVERSION_ERROR;
        break;
      default:
        eventName = ANALYTICS_EVENTS.TOOL_USED;
    }

    logAnalyticsEvent(eventName, {
      operation_type: operationType,
      source: 'manual_tracking',
      ...fileDetails,
    });
  };

  // Function to track user authentication
  const trackAuthentication = (
    authType: 'login' | 'signup' | 'logout' | 'password_reset',
    method: 'email' | 'google' | 'github' | 'other',
    success: boolean,
    errorMessage?: string
  ) => {
    const eventName = authType === 'login'
      ? ANALYTICS_EVENTS.LOGIN
      : authType === 'signup'
        ? ANALYTICS_EVENTS.SIGNUP
        : `auth_${authType}`;

    logAnalyticsEvent(eventName, {
      auth_method: method,
      auth_type: authType,
      success,
      error_message: !success ? errorMessage : undefined,
      source: 'manual_tracking',
    });
  };

  // Function to track subscription events
  const trackSubscription = (
    stage: 'viewed' | 'started' | 'completed' | 'cancelled',
    plan: string,
    price?: number,
    currency?: string,
    interval?: 'monthly' | 'yearly'
  ) => {
    let eventName;

    switch (stage) {
      case 'viewed':
        eventName = ANALYTICS_EVENTS.SUBSCRIPTION_VIEWED;
        break;
      case 'started':
        eventName = ANALYTICS_EVENTS.SUBSCRIPTION_STARTED;
        break;
      case 'completed':
        eventName = ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED;
        break;
      default:
        eventName = `subscription_${stage}`;
    }

    logAnalyticsEvent(eventName, {
      subscription_plan: plan,
      subscription_price: price,
      subscription_currency: currency,
      subscription_interval: interval,
      source: 'manual_tracking',
    });
  };

  // Function to track errors
  const trackError = (
    errorType: string,
    errorMessage: string,
    componentName?: string,
    additionalInfo?: Record<string, any>
  ) => {
    logAnalyticsEvent(ANALYTICS_EVENTS.ERROR, {
      error_type: errorType,
      error_message: errorMessage,
      component: componentName,
      source: 'manual_tracking',
      ...additionalInfo,
    });
  };

  return {
    trackPageView: (additionalParams?: Record<string, any>) => {
      logAnalyticsEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
        page_path: pathname,
        page_search: searchParams ? searchParams.toString() : '',
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        source: 'manual_tracking',
        ...additionalParams,
      });
    },
    trackToolUsage,
    trackFileOperation,
    trackAuthentication,
    trackSubscription,
    trackError,
    logEvent: logAnalyticsEvent, // Expose the raw logEvent function for custom events
  };
};