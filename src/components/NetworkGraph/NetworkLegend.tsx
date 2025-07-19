export const NetworkLegend = ({ buyPct, sellPct, centralToken }: { buyPct: number; sellPct: number; centralToken: string }) => (
  <div className="flex justify-center items-center py-2">
    <span className="mr-4 text-green-400 font-semibold">% Inflow (of {centralToken}): {Math.round(buyPct)}%</span>
    <span className="text-red-400 font-semibold">% Outflow (of {centralToken}): {Math.round(sellPct)}%</span>
  </div>
); 