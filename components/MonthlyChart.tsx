"use client";

interface MonthlyPoint {
  month: string;
  earnings: number;
  advances: number;
  payments: number;
}

interface Props {
  data: MonthlyPoint[];
}

export default function MonthlyChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-8">
        No payment history yet. Once payments settle, your monthly earnings will appear here.
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.earnings));
  const total = data.reduce((sum, d) => sum + d.earnings, 0);
  const avg = total / data.length;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            12 Month Earnings
          </p>
          <p className="text-2xl font-bold text-white">
            ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Avg / month</p>
          <p className="text-sm font-semibold text-white">
            ${avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2 h-40">
        {data.map((point, idx) => {
          const heightPct = max > 0 ? (point.earnings / max) * 100 : 0;
          const advancePct =
            point.earnings > 0 ? (point.advances / point.earnings) * 100 : 0;
          return (
            <div
              key={`${point.month}-${idx}`}
              className="flex-1 flex flex-col items-center group"
            >
              <div
                className="w-full bg-purple-500/10 hover:bg-purple-500/20 rounded-t-sm relative transition-all"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
                title={`${point.month}: $${point.earnings.toLocaleString()} (advances $${point.advances.toLocaleString()}, payments $${point.payments.toLocaleString()})`}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-sm"
                  style={{ height: `${advancePct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-2">
                {point.month}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-purple-500 to-indigo-500" />
          Advances
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-purple-500/10 border border-purple-500/30" />
          Payments
        </div>
      </div>
    </div>
  );
}
