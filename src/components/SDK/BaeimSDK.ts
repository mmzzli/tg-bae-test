import { WKSDK, MessageText, Channel, ChannelTypePerson, ConnectStatus, Message, MessageListener } from "wukongimjssdk";

interface BaeimSDKOptions {
  token: string;
  userUid: string;
  serverAddr: string;
}

class BaeimSDK {
  private token: string;
  private userUid: string;
  private serverAddr: string;
  private messageListener?: (message: Message) => void;

  constructor(options: BaeimSDKOptions) {
    this.token = options.token;
    this.userUid = options.userUid;
    this.serverAddr = options.serverAddr;
  }

  private initializeSDK() {
    if (!this.token || !this.userUid) {
      console.error('Token or User UID is missing.');
      return;
    }
    const config = WKSDK.shared().config;
    config.uid = String(this.userUid);
    config.token = this.token;
    config.addr = this.serverAddr;
    WKSDK.shared().config = config;

    this.connect();
  }

  private async connect() {
    try {
      await WKSDK.shared().connect();
      console.log('SDK connected successfully.');
    } catch (error) {
      console.error('Failed to connect SDK:', error);
    }
  }

  private handleConnectStatus(status: ConnectStatus) {
    switch (status) {
      case ConnectStatus.Connected:
        console.log("1");
        break;
      case ConnectStatus.Disconnect:
        console.log("2");
        break;
      default:
        console.log("3:", status);
        break;
    }
  }

  public async sendMessage(content: string, channelId: string) {
    try {
      const textMessage = new MessageText(content);
      await WKSDK.shared().chatManager.send(textMessage, new Channel(channelId, ChannelTypePerson));
      console.log('Message sent successfully');
    } catch (error) {
      console.error('error:', error);
    }
  }

  public addMessageListener(listener: (message: Message) => void) {
    this.messageListener = listener;
    WKSDK.shared().chatManager.addMessageListener(this.messageHandler);
  }

  public removeMessageListener() {
    if (this.messageListener) {
      WKSDK.shared().chatManager.removeMessageListener(this.messageHandler);
      this.messageListener = undefined;
    }
  }

  private messageHandler = (message: Message) => {
    if (this.messageListener) {
      this.messageListener(message);
    }
  }

  public start() {
    this.initializeSDK();
    WKSDK.shared().connectManager.addConnectStatusListener(this.handleConnectStatus);
  }

  public stop() {
    WKSDK.shared().connectManager.removeConnectStatusListener(this.handleConnectStatus);
    this.removeMessageListener();
  }
}

export default BaeimSDK;
