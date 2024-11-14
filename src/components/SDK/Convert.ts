import { MessageContentType, Setting, Conversation as WKConversation } from 'wukongimjssdk'
import { Conversation, FormattedMessage } from './BaeimSDK'
import { WKSDK, Message, StreamItem, Channel, MessageStatus, MessageExtra } from 'wukongimjssdk'
import BigNumber from 'bignumber.js'
import { Buffer } from 'buffer'
export class Convert {
  static toMessage(msgMap: any): FormattedMessage {
    const message = new Message() as FormattedMessage

    if (msgMap['message_idstr']) {
      message.messageID = msgMap['message_idstr']
    } else {
      message.messageID = new BigNumber(msgMap['message_id']).toString()
    }
    if (msgMap['header']) {
      message.header.reddot = msgMap['header']['red_dot'] === 1 ? true : false
    }
    if (msgMap['setting']) {
      message.setting = Setting.fromUint8(msgMap['setting'])
    }
    if (msgMap['revoke']) {
      message.remoteExtra.revoke = msgMap['revoke'] === 1 ? true : false
    }
    if (msgMap['message_extra']) {
      const messageExtra = msgMap['message_extra']
      message.remoteExtra = this.toMessageExtra(messageExtra)
    }

    message.clientSeq = msgMap['client_seq']
    message.channel = new Channel(msgMap['channel_id'], msgMap['channel_type'])
    message.toUID = msgMap['channel_id']
    message.messageSeq = msgMap['message_seq']
    message.clientMsgNo = msgMap['client_msg_no']
    message.streamNo = msgMap['stream_no']
    message.streamFlag = msgMap['stream_flag']
    message.fromUID = msgMap['from_uid']
    message.timestamp = msgMap['timestamp']
    message.status = MessageStatus.Normal

    let contentType = 0
    try {
      const decodedBuffer = Buffer.from(msgMap['payload'], 'base64')
      const contentObj = JSON.parse(decodedBuffer.toString('utf8'))
      if (contentObj) {
        contentType = contentObj.type
      }
      const messageContent = WKSDK.shared().getMessageContent(contentType)
      if (contentObj) {
        messageContent.decode(this.stringToUint8Array(JSON.stringify(contentObj)))
      }
      message.content = messageContent
    } catch (error) {
      console.log(error)
      // if error, set to unknown
      const messageContent = WKSDK.shared().getMessageContent(MessageContentType.unknown)
      message.content = messageContent
    }

    if (message.content.text) {
      try {
        message.content.entity = JSON.parse(message.content.text)
      } catch (error) {
        console.log('message content entity parse error', error)
      }
    }

    message.isDeleted = msgMap['is_deleted'] === 1

    const streamMaps = msgMap['streams']
    if (streamMaps && streamMaps.length > 0) {
      const streams = new Array<StreamItem>()
      for (const streamMap of streamMaps) {
        const streamItem = new StreamItem()
        streamItem.clientMsgNo = streamMap['client_msg_no']
        streamItem.streamSeq = streamMap['stream_seq']
        if (streamMap['blob'] && streamMap['blob'].length > 0) {
          const blob = Buffer.from(streamMap['blob'], 'base64')
          const blobObj = JSON.parse(blob.toString('utf8'))
          const blobType = blobObj.type
          const blobContent = WKSDK.shared().getMessageContent(contentType)
          if (blobObj) {
            blobContent.decode(this.stringToUint8Array(JSON.stringify(blobObj)))
          }
          streamItem.clientMsgNo = streamMap['client_msg_no']
          streamItem.streamSeq = streamMap['stream_seq']
          streamItem.content = blobContent
        }
        streams.push(streamItem)
      }
      message.streams = streams
    }

    return message
  }

  static toConversation(conversationMap: any): Conversation {
    const conversation = new WKConversation() as Conversation
    conversation.channel = new Channel(
      conversationMap['channel_id'],
      conversationMap['channel_type']
    )
    conversation.unread = conversationMap['unread'] || 0
    conversation.timestamp = conversationMap['timestamp'] || 0
    let recents = conversationMap['recents']
    if (recents && recents.length > 0) {
      const messageModel = this.toMessage(recents[0])
      conversation.lastMessage = messageModel
      conversation.recents = recents.map((item: any) => this.toMessage(item))
    }

    conversation.extra = {}

    return conversation
  }

  static toMessageExtra(msgExtraMap: any): MessageExtra {
    const messageExtra = new MessageExtra()
    if (msgExtraMap['message_id_str']) {
      messageExtra.messageID = msgExtraMap['message_id_str']
    } else {
      messageExtra.messageID = new BigNumber(msgExtraMap['message_id']).toString()
    }
    messageExtra.messageSeq = msgExtraMap['message_seq']
    messageExtra.readed = msgExtraMap['readed'] === 1
    if (msgExtraMap['readed_at'] && msgExtraMap['readed_at'] > 0) {
      messageExtra.readedAt = new Date(msgExtraMap['readed_at'])
    }
    messageExtra.revoke = msgExtraMap['revoke'] === 1
    if (msgExtraMap['revoker']) {
      messageExtra.revoker = msgExtraMap['revoker']
    }
    messageExtra.readedCount = msgExtraMap['readed_count'] || 0
    messageExtra.unreadCount = msgExtraMap['unread_count'] || 0
    messageExtra.extraVersion = msgExtraMap['extra_version'] || 0
    messageExtra.editedAt = msgExtraMap['edited_at'] || 0

    const contentEditObj = msgExtraMap['content_edit']
    if (contentEditObj) {
      const contentEditContentType = contentEditObj.type
      const contentEditContent = WKSDK.shared().getMessageContent(contentEditContentType)
      const contentEditPayloadData = this.stringToUint8Array(JSON.stringify(contentEditObj))
      contentEditContent.decode(contentEditPayloadData)
      messageExtra.contentEditData = contentEditPayloadData
      messageExtra.contentEdit = contentEditContent

      messageExtra.isEdit = true
    }

    return messageExtra
  }
  static stringToUint8Array(str: string): Uint8Array {
    const newStr = unescape(encodeURIComponent(str))
    var arr = []
    for (var i = 0, j = newStr.length; i < j; ++i) {
      arr.push(newStr.charCodeAt(i))
    }
    var tmpUint8Array = new Uint8Array(arr)
    return tmpUint8Array
  }
}
