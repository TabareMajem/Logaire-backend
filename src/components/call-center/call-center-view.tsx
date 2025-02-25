'use client';

import { useCallCenter } from './call-center-context';
import { ChatWindow } from './chat-window';
import { CallControls } from './call-controls';

export function CallCenterView() {
  const { isCallActive } = useCallCenter();

  return (
    <div className="flex flex-col h-full gap-4">
      <CallControls />
      <ChatWindow />
    </div>
  );
} 