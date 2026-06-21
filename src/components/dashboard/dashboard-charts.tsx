"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface CostTrendProps {
  data: { month: string; cost: number }[];
}

interface ServiceDistributionProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#00E5FF', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981'];

export function MonthlyCostChart({ data }: CostTrendProps) {
  return (
    <div className="h-[300px] w-full">
      {data.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">
          Belum ada data pengeluaran
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(value) => `Rp ${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: '#334155', opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#F8FAFC' 
              }}
              formatter={(value: any) => [`Rp ${Number(value).toLocaleString("id-ID")}`, "Total Biaya"]}
            />
            <Bar dataKey="cost" fill="#00E5FF" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function ServiceDistributionChart({ data }: ServiceDistributionProps) {
  return (
    <div className="h-[300px] w-full">
      {data.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">
          Belum ada data servis
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#F8FAFC' 
              }}
              formatter={(value: any) => [value, "Jumlah"]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
