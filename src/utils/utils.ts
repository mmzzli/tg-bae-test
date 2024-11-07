import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i;
  return mobileRegex.test(userAgent);
};