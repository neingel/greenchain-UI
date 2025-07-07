import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { date: "Jan", credits: 40 },
  { date: "Feb", credits: 50 },
  { date: "Mar", credits: 65 },
  { date: "Apr", credits: 80 },
  { date: "May", credits: 90 },
  { date: "Jun", credits: 110 },
];

export default function CarbonChart() {
  return (
    <div className="w-full h-64 bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Carbon Credits Balance</h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="credits" stroke="#16a34a" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}