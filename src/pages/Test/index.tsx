import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store';
import { useTMAUtils } from '@/hooks/useTMAUtils'
import BaeimSDK from '@/components/SDK/BaeimSDK'


interface Message {
    content: string;
}

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const { othersUserInfo, token } = useStore((state) => ({
        othersUserInfo: state.othersUserInfo,
        token: state.token
    }));
    const { launchParams } = useTMAUtils()
    const currentUid = launchParams.initData?.user?.id ?? 0
    const sdkRef = React.useRef<BaeimSDK | null>(null);


    useEffect(() => {
      if (!token || !currentUid) return;
      console.log(currentUid)

      const sdk = new BaeimSDK({
          token,
          userUid: String(currentUid),
          serverAddr: 'wss://chat-dev.anyconn.org:8210'
      });
      sdkRef.current = sdk;
      sdk.start();

      sdkRef.current?.addMessageListener((message) => {
        console.log(message.content?.text)
      });

      return () => {
          sdkRef.current?.stop();
      };
  }, [token, currentUid]);

    const sendMessage = () => {
      sdkRef.current?.sendMessage("hello", String(7779653776));
    };

    return (
        <div>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                      {msg.content}
                    </li>
                ))}
            </ul>
            <button className='text-[#fff]' onClick={sendMessage}>Send Message</button>
        </div>
    );
};

export default ChatComponent;
