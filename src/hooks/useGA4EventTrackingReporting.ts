import { useCallback } from 'react';

/**
 * @interface GA4EventParams
 * @description 定义 GA4 事件的通用参数结构
 */
interface GA4EventParams {
  [key: string]: any;
}

/**
 * @interface GA4TrackingMethods
 * @description 定义所有可用的 GA4 追踪方法
 */
interface GA4TrackingMethods {
  trackEvent: (eventName: string, eventParams?: GA4EventParams) => void;
  trackPurchase: (params: {
    transaction_id: string;
    /** 购买金额 */
    value: number;
    /** 货币代码，默认为 'STRTS' */
    currency?: string;
    /** BAE用户名 */
    bae_user_name?: string;
    /** Telegram用户名 */
    tg_user_name?: string;
    /** Telegram用户ID */
    tg_user_id?: string;
    /** 购买的商品列表 */
    items?: Array<{
      /** 商品ID */
      item_id: string;
      /** 商品名称 */
      name: string;
      /** 商品数量 */
      quantity?: number;
      /** 其他可选属性 */
      [key: string]: any;
    }>;
  }) => void;
  trackPageView: (pageTitle: string, pagePath: string) => void;
  trackButtonClick: (buttonName: string, buttonLocation: string) => void;
}

/**
 * @description 提供 GA4 事件追踪的自定义 Hook，包含通用事件、购买事件、页面访问和按钮点击的追踪功能
 * @returns {GA4TrackingMethods} 返回包含所有追踪方法的对象
 * @example
 * ```tsx
 * const { trackEvent, trackPurchase, trackPageView, trackButtonClick } = useGA4EventTrackingReporting();
 *
 * // 追踪通用事件
 * trackEvent('custom_event', { param1: 'value1' });
 *
 * // 追踪购买事件
 * trackPurchase({
 *   transaction_id: 'T_12345',
 *   value: 100,
 *   currency: 'STRTS',
 *   bae_user_name: 'Bae User Name',
 *   tg_user_name: 'TG User Name',
 *   tg_user_id: 'TG User ID',
 *   items: [{
 *     item_id: 'SKU_12345',
 *     name: 'Product Name',
 *     quantity: 1
 *   }]
 * });
 *
 * // 追踪页面访问
 * trackPageView('Home Page', '/home');
 *
 * // 追踪按钮点击
 * trackButtonClick('Submit', 'Form Footer');
 * ```
 */
export const useGA4EventTrackingReporting = (): GA4TrackingMethods => {
  /**
   * @param {string} eventName - 事件名称
   * @param {GA4EventParams} [eventParams] - 事件参数
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
   * @param {Object} params - 购买事件参数
   * @param {string} params.transaction_id - 唯一交易标识符
   * @param {number} params.value - 购买金额
   * @param {string} params.bae_user_name - BAE用户名
   * @param {string} params.tg_user_name - Telegram用户名
   * @param {string} params.tg_user_id - Telegram用户ID
   * @param {string} [params.currency='STRTS'] - 货币代码，默认为 STRTS
   * @param {Array<Object>} [params.items] - 购买的商品列表
   * @param {string} params.items[].id - 商品ID
   * @param {string} params.items[].name - 商品名称
   */
  const trackPurchase = useCallback((params: {
    transaction_id: string;
    value: number;
    currency?: string;
    bae_user_name?: string;
    tg_user_name?: string;
    tg_user_id?: string;
    items?: Array<{
      item_id: string;
      name: string;
      [key: string]: any;
      quantity?: number;
    }>;
  }) => {
    console.log('trackPurchase', params)
    // 当前追踪的purchase_user事件是purchase的副本，需要配置在GA4中
    trackEvent('purchase_user', {
      currency: params.currency || 'STRTS',
      ...params,
    });
  }, [trackEvent]);

  /**
   * @param {string} pageTitle - 页面标题
   * @param {string} pagePath - 页面路径
   */
  const trackPageView = useCallback((pageTitle: string, pagePath: string) => {
    trackEvent('page_view', {
      page_title: pageTitle,
      page_path: pagePath,
    });
  }, [trackEvent]);

  /**
   * @param {string} buttonName - 按钮名称或标识符
   * @param {string} buttonLocation - 按钮位置或上下文
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

/**
 * @interface Window
 * @description 扩展全局 Window 接口以包含 Google Analytics 的 gtag 函数
 */
declare global {
  interface Window {
    /**
     * @param {string} command - 追踪命令，通常为 'event'
     * @param {string} eventName - 事件名称
     * @param {Record<string, any>} [eventParams] - 事件参数
     */
    gtag: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}
