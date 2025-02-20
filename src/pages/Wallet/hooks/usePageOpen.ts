import { useWebApp } from '@vkruglikov/react-telegram-web-app'

const usePageOpen = () => {
  const webApp = useWebApp()
  const openLink = (link: string | undefined) => {
    if (!link) return
    if (typeof window !== 'undefined' && window.location.protocol == 'http:') {
      window.location.href = link
    } else {
      return webApp?.openLink(link)
    }
  }

  return {
    openLink
  }
}

export default usePageOpen
