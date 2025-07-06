import React from 'react';
import type { NetworkGraphContainerProps } from './types/networkGraph';

export const NetworkGraphContainer: React.FC<NetworkGraphContainerProps> = ({
  children,
  centralToken
}) => {
  return (
    <div className="w-full flex justify-center bg-gray-950">
      <div className="w-full max-w-[1700px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Network Graph - {centralToken}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}; 