"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from "recharts";

const mockMonthlyData = [
  { name: "Jan", total: 400 },
  { name: "Feb", total: 300 },
  { name: "Mar", total: 600 },
  { name: "Apr", total: 800 },
  { name: "May", total: 500 },
  { name: "Jun", total: 900 },
  { name: "Jul", total: 1100 },
];

const mockStatusData = [
  { name: "Paid", value: 400, color: "#10b981" },
  { name: "Pending", value: 300, color: "#f59e0b" },
  { name: "Cancelled", value: 100, color: "#ef4444" },
];

export function DashboardCharts({ translations }: { translations: { activityOverTime: string; statusDistribution: string } }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      {/* Revenue/Orders Over Time */}
      <div className="card-rounded p-8 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-6 h-[450px]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight">{translations.activityOverTime}</h3>
        </div>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockMonthlyData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px 16px',
                  fontWeight: '900',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#10b981" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card-rounded p-8 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-6 h-[450px]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight">{translations.statusDistribution}</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full pb-10">
           <div className="w-full h-[250px] md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {mockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="flex flex-col gap-4 w-full md:w-1/2">
              {mockStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 card-rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{item.name}</span>
                  </div>
                  <span className="font-black text-sm">{item.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
