import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
// 初始化 Worker
const m3u8Worker = new Worker(new URL('./utils/Worker/loadm3u8.ts', import.meta.url))

window.m3u8Worker = m3u8Worker

if (import.meta.env.MODE !== 'production') {
  import('vconsole').then((VConsole) => {
    const vConsole = new VConsole.default()
    console.log('vConsole manually loaded:', vConsole)
  })
}

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
}

createRoot(document.getElementById('root')!).render(<App />)
