import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css'
// 初始化 Worker
// const m3u8Worker = new Worker(new URL('./utils/Worker/loadm3u8.ts', import.meta.url))

// window.m3u8Worker = m3u8Worker

import('vconsole').then((VConsole) => {
  window.vConsole = VConsole
  window.vConsoleInstance = new window.vConsole.default()
  window.vConsoleInstance.hideSwitch()
  if (import.meta.env.MODE !== 'production') {
    window.vConsoleInstance.showSwitch()
  }
})

if (import.meta.env.MODE === 'production') {
  const gaScript = document.createElement('script')
  gaScript.setAttribute('async', '')
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XPKLLC0SSN'
  document.head.appendChild(gaScript)

  const inlineScript = document.createElement('script')
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XPKLLC0SSN');
  `
  document.head.appendChild(inlineScript)

  // Add Umami Analytics
  const umamiScript = document.createElement('script')
  umamiScript.setAttribute('defer', '')
  umamiScript.src = 'https://cloud.umami.is/script.js'
  umamiScript.setAttribute('data-website-id', '9895842a-d518-414e-80b4-6d1f8166d9f4')
  document.head.appendChild(umamiScript)
}

// function setRem() {
//   const baseSize = 16;
//   const designWidth = 375;
//   const html = document.documentElement;
//   const clientWidth = html.clientWidth;
//   html.style.fontSize = `${(clientWidth / designWidth) * baseSize}px`;
// }
// setRem();
// window.addEventListener('resize', setRem);


// Sentry.init({
//   dsn: 'https://0201b69ad2e7cf4be3c444e2782ed79f@o4508635704590336.ingest.us.sentry.io/4508635707211776',
//   integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
//   environment: import.meta.env.MODE,
//   // Tracing
//   tracesSampleRate: 1.0, //  Capture 100% of the transactions
//   // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//   tracePropagationTargets: ['*', '/api/*'],
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// })

createRoot(document.getElementById('root')!).render(<App />)
