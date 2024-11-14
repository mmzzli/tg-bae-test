import {
  WKSDK,
  MessageText,
  Channel,
  ChannelTypePerson,
  ConnectStatus,
  Message,
  MessageListener,
  Conversation as WKConversation,
  ConversationAction,
  PullMode,
  SyncOptions,
} from 'wukongimjssdk'
import { Convert } from './Convert'

export type FormattedMessage = Message & {
  toUID: string
}

export type Conversation = WKConversation & { recents?: FormattedMessage[] }

interface BaeimSDKOptions {
  token: string
  userUid: string
  serverAddr: string
  syncConversationsCallback?: () => Promise<Conversation[]>
  syncMessagesCallback?: (channel: Channel, opts: SyncOptions) => Promise<Message[]>
}

type GetMessagesOpt = {
  startMessageSeq: number // startMessageSeq（结果包含startMessageSeq的消息）
  endMessageSeq: number // endMessageSeq（结果不包含endMessageSeq的消息）0表示不限制
  limit: number
  pullMode: PullMode // 0:向下拉取 1:向上拉取
}
class BaeimSDK {
  private token: string
  private userUid: string
  private serverAddr: string
  private messageListener?: (message: FormattedMessage) => void
  private syncConversationsCallback?: () => Promise<Conversation[]>
  private syncMessagesCallback?: (channel: Channel, opts: SyncOptions) => Promise<Message[]>
  private connectionStatusListeners: Set<(status: ConnectStatus) => void> = new Set()
  public status: ConnectStatus

  constructor(options: BaeimSDKOptions) {
    this.token = options.token
    this.userUid = options.userUid
    this.serverAddr = options.serverAddr
    this.status = ConnectStatus.Disconnect
    this.syncConversationsCallback = options.syncConversationsCallback
    this.syncMessagesCallback = options.syncMessagesCallback
    this.handleConnectStatus = this.handleConnectStatus.bind(this)
  }

  private initializeSDK() {
    if (!this.token || !this.userUid) {
      console.error('Token or User UID is missing.')
      return
    }
    const config = WKSDK.shared().config
    config.uid = String(this.userUid)
    config.token = this.token
    config.addr = this.serverAddr
    if (this.syncConversationsCallback) {
      const cb = async () => {
        let resultConversations = new Array<Conversation>()
        const resp = await this.syncConversationsCallback?.()
        if (resp) {
          resp.forEach((v: any) => {
            const conversation = Convert.toConversation(v)
            resultConversations.push(conversation)
          })
        }
        return resultConversations
      }
      config.provider.syncConversationsCallback = cb
    }
    if (this.syncMessagesCallback) {
      const cb = async (channel: Channel, opts: SyncOptions) => {
        let resultMessages = new Array<Message>()
        const resp = await this.syncMessagesCallback?.(channel, opts)
        if (resp) {
          resp.forEach((v: any) => {
            const message = Convert.toMessage(v)
            resultMessages.push(message)
          })
        }
        return resultMessages
      }
      config.provider.syncMessagesCallback = cb
    }
    WKSDK.shared().config = config

    this.connect()
  }

  private async connect() {
    try {
      await WKSDK.shared().connect()
      console.log('SDK connected successfully.')
    } catch (error) {
      console.error('Failed to connect SDK:', error)
    }
  }

  private handleConnectStatus(status: ConnectStatus) {
    this.status = status
    this.connectionStatusListeners.forEach((listener) => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in channel listener:', error)
      }
    })
  }

  public async sendMessage(content: string, channelId: string) {
    try {
      const textMessage = new MessageText(content)
      await WKSDK.shared().chatManager.send(textMessage, new Channel(channelId, ChannelTypePerson))
    } catch (error) {
      console.error('sendMessage error:', error)
    }
  }

  public addMessageListener(listener: (message: FormattedMessage) => void) {
    this.messageListener = listener
    WKSDK.shared().chatManager.addMessageListener(this.messageHandler)
  }

  public removeMessageListener() {
    if (this.messageListener) {
      WKSDK.shared().chatManager.removeMessageListener(this.messageHandler)
      this.messageListener = undefined
    }
  }

  public addConversationListener(
    listener: (conversation: Conversation, action: ConversationAction) => void
  ): () => void {
    WKSDK.shared().conversationManager.addConversationListener(listener)
    return () => {
      WKSDK.shared().conversationManager.removeConversationListener(listener)
    }
  }

  public addConnectionStatusListener(listener: (status: ConnectStatus) => void) {
    this.connectionStatusListeners.add(listener)

    return () => {
      this.removeConnectionStatusListener(listener)
    }
  }

  public removeConnectionStatusListener(listener: (status: ConnectStatus) => void) {
    this.connectionStatusListeners.delete(listener)
  }

  public async getAllConversation(): Promise<Conversation[]> {
    return await WKSDK.shared().conversationManager.sync({})
  }

  public async createEmptyConversation(channelId: string): Promise<Conversation> {
    return await WKSDK.shared().conversationManager.createEmptyConversation(
      new Channel(channelId, ChannelTypePerson)
    )
  }

  public removeConversation(channelId: string) {
    return WKSDK.shared().conversationManager.removeConversation(
      new Channel(channelId, ChannelTypePerson)
    )
  }

  public clearConversationUnread(channelId: string) {
    const conversation = WKSDK.shared().conversationManager.findConversation(
      new Channel(channelId, ChannelTypePerson)
    )
    if (conversation) {
      conversation.unread = 0
      WKSDK.shared().conversationManager.notifyConversationListeners(
        conversation,
        ConversationAction.update
      )
    }
  }

  public async getMessages(channel: string, opt: GetMessagesOpt): Promise<Message[]> {
    return await WKSDK.shared().chatManager.syncMessages(
      new Channel(channel, ChannelTypePerson),
      opt
    )
  }

  private messageHandler = (message: Message) => {
    if (this.messageListener) {
      if (message.content.text) {
        try {
          message.content.entity = JSON.parse(message.content.text)
        } catch (error) {
          console.log('message content entity parse error', error)
        }
      }
      this.messageListener({
        ...message,
        toUID: message.channel.channelID,
      } as FormattedMessage)
    }
  }

  public start() {
    this.initializeSDK()
    WKSDK.shared().connectManager.addConnectStatusListener(this.handleConnectStatus)
  }

  public stop() {
    WKSDK.shared().connectManager.removeConnectStatusListener(this.handleConnectStatus)
    this.removeMessageListener()
  }
}

export { ConnectStatus, ConversationAction, SyncOptions, Channel, Message }
export default BaeimSDK
