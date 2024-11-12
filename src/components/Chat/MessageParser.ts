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
  private patterns = {
    url: /((ftp|https?):\/\/)?((www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z][-a-zA-Z0-9]{1,62})\b([-a-zA-Z0-9()@:%_+.,~#?&/=]*)/gi,
    telegramLink:
      /(?:https?:\/\/)?(?:[-a-zA-Z0-9@:%_+~#=]{1,32}\.)?t\.me\/[a-zA-Z0-9_]+(?:\/[a-zA-Z0-9_]+)?(?:\?[a-zA-Z0-9_=&%-]+)?/gi,
  }

  // cache link preview result
  private previewCache: Map<string, LinkMetadata> = new Map()
  private telegramCache: Map<string, LinkMetadata> = new Map()

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
    // check cache
    if (this.previewCache.has(url)) {
      return this.previewCache.get(url)!
    }

    const preview = await getLinkMetadata(url)

    return {
      site_name: preview?.site_name,
      title: preview?.title,
      desc: preview?.desc,
      image: preview?.image,
      url: preview?.url,
    }
  }

  private async getTelegramPreview(url: string): Promise<LinkMetadata> {
    if (this.telegramCache.has(url)) {
      return this.telegramCache.get(url)!
    }

    const preview = await getLinkMetadata(url)

    return {
      site_name: preview?.site_name,
      title: preview?.title,
      desc: preview?.desc,
      image: preview?.image,
      url: preview?.url,
    }
  }

  // clear cache
  public clearCache() {
    this.previewCache.clear()
    this.telegramCache.clear()
  }
}
