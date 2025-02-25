'use client';

import { useCallCenter } from './call-center-context';

export function CallControls() {
  const { isCallActive } = useCallCenter();

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span>{isCallActive ? 'In Call' : 'Ready for Calls'}</span>
        </div>
        {isCallActive && (
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            End Call
          </button>
        )}
      </div>
    </div>
  );
} 