import { Conversation } from '@/components/SDK/BaeimSDK'

export const sortConversations = (conversations?: Array<Conversation>) => {
  let newConversations = conversations

  if (!newConversations || newConversations.length <= 0) {
    return []
  }
  let sortAfter = newConversations.sort((a, b) => {
    let aScore = a.timestamp
    let bScore = b.timestamp
    if (a.extra?.top === 1) {
      aScore += 1000000000000
    }
    if (b.extra?.top === 1) {
      bScore += 1000000000000
    }
    return bScore - aScore
  })
  return sortAfter
}
