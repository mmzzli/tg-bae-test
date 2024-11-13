import { getLinkMetadata } from '@/api'
import { LinkMetadata } from '@/types'

export interface ParsedContent {
  type: 'text' | 'link' | 'telegram' | 'mention' | 'hashtag'
  content: string
  metadata?: LinkMetadata
  index: number
  length: number
}

export class MessageParser {
  private static previewCache: Map<string, LinkMetadata> = new Map()
  private static telegramCache: Map<string, LinkMetadata> = new Map()

  private static readonly MAX_CACHE_SIZE = 10000

  private patterns = {
    url: /((ftp|https?):\/\/)?((www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z][-a-zA-Z0-9]{1,62})\b([-a-zA-Z0-9()@:%_+.,~#?&/=]*)/gi,
    telegramLink:
      /(?:https?:\/\/)?(?:[-a-zA-Z0-9@:%_+~#=]{1,32}\.)?t\.me\/[a-zA-Z0-9_]+(?:\/[a-zA-Z0-9_]+)?(?:\?[a-zA-Z0-9_=&%-]+)?/gi,
  }

  async parseText(text: string): Promise<ParsedContent[]> {
    const parts: ParsedContent[] = []
    let lastIndex = 0
    let remainingText = text

    const tgMatches = this.findMatches(text, this.patterns.telegramLink, 'telegram')

    // replace matched telegram links with spaces
    for (const match of tgMatches) {
      remainingText =
        remainingText.slice(0, match.index) +
        ' '.repeat(match.length) +
        remainingText.slice(match.index + match.length)
    }

    // match normal links in remaining text
    const urlMatches = this.findMatches(remainingText, this.patterns.url, 'link')

    // merge and sort all matches
    const matches = [...tgMatches, ...urlMatches].sort((a, b) => a.index - b.index)

    for (const match of matches) {
      // add text before match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
          index: lastIndex,
          length: match.index - lastIndex,
        })
      }

      parts.push(match)
      lastIndex = match.index + match.length
    }

    // add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
        index: lastIndex,
        length: text.length - lastIndex,
      })
    }
    return parts
  }

  async loadFirstLinkMetadata(parts: ParsedContent[]): Promise<ParsedContent[]> {
    const firstLink = parts.find((part) => part.type === 'link' || part.type === 'telegram')
    if (firstLink) {
      try {
        if (firstLink.type === 'link') {
          firstLink.metadata = await this.getLinkPreview(firstLink.content)
        } else if (firstLink.type === 'telegram') {
          firstLink.metadata = await this.getTelegramPreview(firstLink.content)
        }
      } catch (error) {
        console.error(error)
      }
    }
    return parts
  }

  private findMatches(text: string, pattern: RegExp, type: ParsedContent['type']): ParsedContent[] {
    const matches: ParsedContent[] = []
    let match: RegExpExecArray | null

    // reset RegExp lastIndex
    pattern.lastIndex = 0

    while ((match = pattern.exec(text)) !== null) {
      const currentIndex = match.index
      const initialMatch = match[0]

      pattern.lastIndex = currentIndex
      let longestMatch = initialMatch
      let nextMatch: RegExpExecArray | null

      while ((nextMatch = pattern.exec(text)) !== null) {
        if (nextMatch.index === currentIndex) {
          longestMatch = nextMatch[0]
        } else {
          break
        }
      }

      matches.push({
        type,
        content: longestMatch,
        index: currentIndex,
        length: longestMatch.length,
      })

      pattern.lastIndex = currentIndex + longestMatch.length
    }

    return matches
  }

  private async getLinkPreview(url: string): Promise<LinkMetadata> {
    console.log(MessageParser.previewCache)
    if (MessageParser.previewCache.has(url)) {
      return MessageParser.previewCache.get(url)!
    }

    if (MessageParser.previewCache.size >= MessageParser.MAX_CACHE_SIZE) {
      const oldestKeys = Array.from(MessageParser.previewCache.keys()).slice(0, 100)
      oldestKeys.forEach((key) => MessageParser.previewCache.delete(key))
    }

    const preview = await getLinkMetadata(url)
    if (preview.image && !preview.image.startsWith('http')) {
      preview.image = `${preview.url}/${preview.image}`
    }
    const res = {
      site_name: preview?.site_name,
      title: preview?.title,
      desc: preview?.desc,
      image: preview?.image,
      url: preview?.url,
    }

    MessageParser.previewCache.set(url, res)
    return res
  }

  private async getTelegramPreview(url: string): Promise<LinkMetadata> {
    if (MessageParser.telegramCache.has(url)) {
      return MessageParser.telegramCache.get(url)!
    }

    if (MessageParser.telegramCache.size >= MessageParser.MAX_CACHE_SIZE) {
      const oldestKeys = Array.from(MessageParser.telegramCache.keys()).slice(0, 100)
      oldestKeys.forEach((key) => MessageParser.telegramCache.delete(key))
    }

    const preview = await getLinkMetadata(url)
    if (preview.image && !preview.image.startsWith('http')) {
      preview.image = `https://${preview.image}`
    }
    const res = {
      site_name: preview?.site_name,
      title: preview?.title,
      desc: preview?.desc,
      image: preview?.image,
      url: preview?.url,
    }

    MessageParser.telegramCache.set(url, res)
    return res
  }

  // clear cache
  public clearCache() {
    MessageParser.previewCache.clear()
    MessageParser.telegramCache.clear()
  }
}
