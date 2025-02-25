'use client';

import { CallCenterView } from '../../../../components/call-center/call-center-view';
import { CallCenterProvider } from '../../../../components/call-center/call-center-context';

export default function CallCenterPage() {
  return (
    <CallCenterProvider>
      <div className="h-full p-4">
        <h2 className="text-2xl font-bold mb-4">Call Center</h2>
        <CallCenterView />
      </div>
    </CallCenterProvider>
  );
} 