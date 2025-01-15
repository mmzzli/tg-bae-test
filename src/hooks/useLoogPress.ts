import { useRef, useEffect, useCallback } from 'react';

interface LongPressOptions {
  delay?: number;             // 长按触发时间（毫秒）
  onLongPress: () => void;    // 长按触发的回调
  onClick?: () => void;       // 短按触发的回调（可选）
}

export function useLongPress({ delay = 500, onLongPress, onClick }: LongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  // 按下时启动定时器
  const startPressTimer = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      onLongPress();
      isLongPressRef.current = true;
    }, delay);
  }, [delay, onLongPress]);

  // 松开时清除定时器
  const clearPressTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 绑定事件
  const onMouseDown = useCallback(() => startPressTimer(), [startPressTimer]);
  const onMouseUp = useCallback(() => {
    if (!isLongPressRef.current && onClick) {
      onClick();  // 短按触发
    }
    clearPressTimer();
  }, [onClick, clearPressTimer]);

  const onTouchStart = useCallback(() => startPressTimer(), [startPressTimer]);
  const onTouchEnd = useCallback(() => {
    if (!isLongPressRef.current && onClick) {
      onClick();  // 短按触发
    }
    clearPressTimer();
  }, [onClick, clearPressTimer]);

  // 清理定时器
  useEffect(() => {
    return () => {
      clearPressTimer();
    };
  }, [clearPressTimer]);

  return {
    onMouseDown,
    onMouseUp,
    onMouseLeave: clearPressTimer,  // 鼠标移出也取消
    onTouchStart,
    onTouchEnd,
  };
}
