import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const MOCK_DATA = [
  { month: "Oct", debit: 245_000, credit: 243_000 },
  { month: "Nov", debit: 267_000, credit: 265_000 },
  { month: "Dec", debit: 289_000, credit: 287_500 },
  { month: "Jan", debit: 312_000, credit: 310_000 },
]

export function MonthlyTrendChart() {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={MOCK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis axisLine={false} dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(value) => {
              const numValue = typeof value === "number" ? value : 0
              return [`$${numValue.toLocaleString()}`, ""]
            }}
          />
          <Bar
            barSize={16}
            dataKey="debit"
            fill="hsl(var(--chart-1))"
            name="Debit"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            barSize={16}
            dataKey="credit"
            fill="hsl(var(--chart-2))"
            name="Credit"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
