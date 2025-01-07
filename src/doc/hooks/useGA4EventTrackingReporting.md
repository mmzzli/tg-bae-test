# GA4 事件追踪 Hook 使用文档

## 简介

`useGA4EventTrackingReporting` 是一个用于 Google Analytics 4 (GA4) 事件追踪的自定义 React Hook。

## 安装前提

确保项目中已经：
1. 安装并正确配置了 Google Analytics 4
2. 在页面中加载了 GA4 的追踪代码
3. 在 GA4 后台配置了相应的自定义事件

## 接口定义

### GA4EventParams
```typescript
interface GA4EventParams {
  [key: string]: any;
}
```

### GA4TrackingMethods
```typescript
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
    }>;
  }) => void;
  trackPageView: (pageTitle: string, pagePath: string) => void;
  trackButtonClick: (buttonName: string, buttonLocation: string) => void;
}
```

## 使用方法

### 基础用法

```typescript
import { useGA4EventTrackingReporting } from './hooks/useGA4EventTrackingReporting';

function YourComponent() {
  const { trackEvent, trackPurchase, trackPageView, trackButtonClick } = useGA4EventTrackingReporting();
  
  // 使用这些方法追踪事件
}
```

### 追踪通用事件
```typescript
trackEvent('custom_event', {
  custom_param: 'value'
});
```

### 追踪购买事件
```typescript
trackPurchase({
  transaction_id: 'T_12345',
  value: 99.99,
  currency: 'STRTS',
  items: [
    {
      item_id: 'SKU_12345',
      name: 'Product Name'
    }
  ]
});
```

### 追踪页面访问
```typescript
trackPageView('Home Page', '/home');
```

### 追踪按钮点击
```typescript
trackButtonClick('Submit', 'Form Footer');
```

## 注意事项

1. 所有追踪方法都包含错误处理，如果 GA4 未正确初始化，将在控制台显示警告信息
2. 购买事件的货币默认为 'STRTS'
3. 确保在使用前检查 `window.gtag` 是否可用
4. 自定义事件需要在 GA4 后台进行相应配置

## 错误处理

该 Hook 内置了错误处理机制：
- 如果 GA4 未初始化，将显示警告信息
- 如果事件追踪失败，将在控制台输出错误信息

## 类型声明

为了支持 TypeScript，该 Hook 包含了必要的全局类型声明：

```typescript
declare global {
  interface Window {
    gtag: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}
```
