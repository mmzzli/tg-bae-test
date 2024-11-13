import {
  WKSDK,
  MessageText,
  Channel,
  ChannelTypePerson,
  ConnectStatus,
  Message,
  MessageListener,
  SyncConversationsCallback,
  Conversation,
  ConversationAction,
  PullMode,
} from 'wukongimjssdk'

interface BaeimSDKOptions {
  token: string
  userUid: string
  serverAddr: string
  syncConversationsCallback: SyncConversationsCallback
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
  private messageListener?: (message: Message) => void
  private syncConversationsCallback: SyncConversationsCallback
  private connectionStatusListeners: Set<(status: ConnectStatus) => void> = new Set()
  public status: ConnectStatus

  constructor(options: BaeimSDKOptions) {
    this.token = options.token
    this.userUid = options.userUid
    this.serverAddr = options.serverAddr
    this.status = ConnectStatus.Disconnect
    this.syncConversationsCallback = options.syncConversationsCallback
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
    config.provider.syncConversationsCallback = this.syncConversationsCallback
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
      console.log('Message sent successfully')
    } catch (error) {
      console.error('error:', error)
    }
  }

  public addMessageListener(listener: (message: Message) => void) {
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
  ) {
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

  public async getMessages(channel: string, opt: GetMessagesOpt): Promise<Message[]> {
    return await WKSDK.shared().chatManager.syncMessages(
      new Channel(channel, ChannelTypePerson),
      opt
    )
  }

  private messageHandler = (message: Message) => {
    if (this.messageListener) {
      this.messageListener(message)
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

export { ConnectStatus, Conversation }
export type { SyncConversationsCallback }
export default BaeimSDK
