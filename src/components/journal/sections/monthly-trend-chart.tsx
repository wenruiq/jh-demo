import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Monthly data showing Journal Entries vs total GL transactions
// Journal Amount = manual adjustments, accruals, reclassifications
// GL Amount = remaining GL balance from sub-ledgers (AP, AR, payroll, etc.)
const MONTHLY_DATA = [
  { month: "Jan", journalAmount: 45_000, glAmount: 180_000 },
  { month: "Feb", journalAmount: 52_000, glAmount: 210_000 },
  { month: "Mar", journalAmount: 48_000, glAmount: 220_000 },
  { month: "Apr", journalAmount: 61_000, glAmount: 230_000 },
  { month: "May", journalAmount: 38_000, glAmount: 175_000 },
  { month: "Jun", journalAmount: 55_000, glAmount: 205_000 },
  { month: "Jul", journalAmount: 59_000, glAmount: 225_000 },
  { month: "Aug", journalAmount: 72_000, glAmount: 245_000 },
  { month: "Sept", journalAmount: 42_000, glAmount: 165_000 },
  { month: "Oct", journalAmount: 68_000, glAmount: 230_000 },
  { month: "Nov", journalAmount: 75_000, glAmount: 240_000 },
  { month: "Dec", journalAmount: 98_000, glAmount: 260_000 },
]

export function MonthlyTrendChart() {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          barCategoryGap="15%"
          data={MONTHLY_DATA}
          margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              backgroundColor: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              padding: "8px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
            formatter={(value, name) => {
              const numValue = typeof value === "number" ? value : 0
              return [`$${numValue.toLocaleString()}`, name]
            }}
            itemStyle={{ color: "var(--color-foreground)" }}
            labelStyle={{ fontWeight: 600, marginBottom: 4, color: "var(--color-foreground)" }}
          />
          <Legend iconSize={10} iconType="square" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
          {/* Stacked bars: Journal Amount on bottom (darker), GL Amount on top (lighter) */}
          <Bar
            dataKey="journalAmount"
            fill="hsl(217 91% 50%)"
            name="Journal Amount"
            radius={[0, 0, 0, 0]}
            stackId="stack"
          />
          <Bar
            dataKey="glAmount"
            fill="hsl(213 94% 82%)"
            name="GL Amount"
            radius={[3, 3, 0, 0]}
            stackId="stack"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
