'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Device } from 'twilio-client';

interface CallCenterContextType {
  isCallActive: boolean;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
}

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const CallCenterContext = createContext<CallCenterContextType | undefined>(undefined);

export function CallCenterProvider({ children }: { children: ReactNode }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const device = new Device();
    device.setup(process.env.NEXT_PUBLIC_TWILIO_TOKEN!);

    device.on('incoming', (connection) => {
      setIsCallActive(true);
      connection.accept();
    });

    return () => {
      device.destroy();
    };
  }, []);

  const sendMessage = (content: string) => {
    setMessages(prev => [...prev, {
      role: 'agent',
      content,
      timestamp: new Date()
    }]);
  };

  return (
    <CallCenterContext.Provider value={{ isCallActive, messages, sendMessage }}>
      {children}
    </CallCenterContext.Provider>
  );
}

export const useCallCenter = () => {
  const context = useContext(CallCenterContext);
  if (context === undefined) {
    throw new Error('useCallCenter must be used within a CallCenterProvider');
  }
  return context;
}; 