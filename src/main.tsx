import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// if (import.meta.env.MODE !== 'production') {
//   import('vconsole').then((VConsole) => {
//     const vConsole = new VConsole.default()
//     console.log('vConsole manually loaded:', vConsole)
//   })
// }

createRoot(document.getElementById('root')!).render(<App />)
