import React from 'react';
import type { NetworkGraphContainerProps } from './types/networkGraph';

export const NetworkGraphContainer: React.FC<NetworkGraphContainerProps> = ({
  children,
  centralToken
}) => {
  return (
    <div className="w-full flex justify-center bg-gray-950">
      <div className="w-full max-w-[1700px] mx-auto">
        {children}
      </div>
    </div>
  );
}; 