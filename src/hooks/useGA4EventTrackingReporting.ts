import { useCallback } from 'react';

interface GA4EventParams {
  [key: string]: any;
}

// Attention:
// Custom event reporting requires configuration in GA4

interface GA4TrackingMethods {
  trackEvent: (eventName: string, eventParams?: GA4EventParams) => void;
  trackPurchase: (params: {
    transaction_id: string;
    value: number;
    currency?: string;
    user_id?: string;
    items?: Array<{
      item_id: string;
      name: string;
      [key: string]: any;
      quantity?: number;
    }>;
  }) => void;
  trackPageView: (pageTitle: string, pagePath: string) => void;
  trackButtonClick: (buttonName: string, buttonLocation: string) => void;
}

/**
 * Custom hook for Google Analytics 4 (GA4) event tracking
 */
export const useGA4EventTrackingReporting = (): GA4TrackingMethods => {
  /**
   * Generic event tracking method
   * @param {string} eventName - Name of the event to track
   * @param {GA4EventParams} [eventParams] - Optional parameters for the event
   */
  const trackEvent = useCallback((
    eventName: string,
    eventParams?: GA4EventParams
  ) => {
    try {
      if (typeof window.gtag !== 'function') {
        console.warn('Google Analytics not initialized');
        return;
      }

      window.gtag('event', eventName, eventParams);
    } catch (error) {
      console.error('Failed to track GA4 event:', error);
    }
  }, []);

  /**
   * Tracks purchase events
   * @param {Object} params - Purchase event parameters
   * @param {string} params.transaction_id - Unique transaction identifier
   * @param {number} params.value - Purchase amount
   * @param {string} [params.currency='STRTS'] - Currency code, defaults to STRTS
   * @param {Array<Object>} [params.items] - Array of purchased items
   * @param {string} params.items[].id - Item identifier
   * @param {string} params.items[].name - Item name
   */
  const trackPurchase = useCallback((params: {
    transaction_id: string;
    value: number;
    currency?: string;
    items?: Array<{
      item_id: string;
      name: string;
      [key: string]: any;
      quantity?: number;
    }>;
  }) => {
    console.log('trackPurchase', params)
    trackEvent('purchase', {
      currency: params.currency || 'STRTS',
      ...params,
    });
  }, [trackEvent]);

  /**
   * Tracks page view events
   * @param {string} pageTitle - Title of the viewed page
   * @param {string} pagePath - Path of the viewed page
   */
  const trackPageView = useCallback((pageTitle: string, pagePath: string) => {
    trackEvent('page_view', {
      page_title: pageTitle,
      page_path: pagePath,
    });
  }, [trackEvent]);

  /**
   * Tracks button click events
   * @param {string} buttonName - Name or identifier of the clicked button
   * @param {string} buttonLocation - Location or context of the button
   */
  const trackButtonClick = useCallback((buttonName: string, buttonLocation: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      button_location: buttonLocation,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPurchase,
    trackPageView,
    trackButtonClick,
  };
};

declare global {
  interface Window {
    gtag: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}
