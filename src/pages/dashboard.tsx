// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import CarbonChart from "../components/CarbonChart";
// import useCarbonChartData from "../hooks/useCarbonChartData";
import useDashboardData from "../hooks/useDashboardData";
import { useWallet } from "../context/walletcontext";

const COLORS = ["#22c55e", "#3b82f6", "#f97316"];

export default function Dashboard() {
  const { account } = useWallet();
  // const chartData = useCarbonChartData(account);

  const { gctBalance, allocationData, transactions } = useDashboardData(account);

  const hasFirstPurchase = parseFloat(gctBalance) > 0;
  const has100GCT = parseFloat(gctBalance) >= 100;
  const hasVerified = allocationData.find((d) => d.name === "Verified" && d.value > 0);

  if (!account) {
    return (
      <div className="text-gray-600 text-sm space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">🔐 Wallet Connection Required</h2>
        <p className="text-gray-700 text-base">
          To view your dashboard content, please connect your cryptocurrency wallet.
        </p>

        <div className="space-y-2 text-gray-700 text-base">
          <p>1. Click the <strong>"Connect Wallet"</strong> button at the top-right corner of the screen.</p>
          <p>2. A popup will appear from your wallet provider (e.g., MetaMask, Coinbase Wallet).</p>
          <p>3. Select your account and approve the connection request.</p>
          <p>4. Once connected, your wallet address and balance will be displayed.</p>
          <p>5. You can now access and interact with your personalized dashboard features.</p>
        </div>

        <p className="text-sm text-gray-600">
          Don’t have a wallet?{' '}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Learn how to set up MetaMask
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here's your latest overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Balance</h2>
            <p className="text-2xl font-bold">100.00 GCT</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Carbon Credit Tokens</h2>
            <p className="text-gray-600 text-sm">Issued, Verified, Traded, Retired</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <CarbonChart/>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">GCT Token Allocation</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {allocationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6 text-sm">
              {allocationData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="text-gray-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
            <ul className="text-sm space-y-1">
              {transactions.map((tx, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{tx.label}</span>
                  <span className="text-gray-500">{tx.timestamp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">🏆 Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded shadow ${hasFirstPurchase ? "bg-green-50" : "bg-gray-100"}`}>
              <p className="text-xl">🥇</p>
              <p className="font-semibold">First Purchase</p>
              {!hasFirstPurchase && <p className="text-xs text-gray-500">Locked</p>}
            </div>
            <div className={`p-4 rounded shadow ${has100GCT ? "bg-green-100" : "bg-gray-100"}`}>
              <p className="text-xl">💰</p>
              <p className="font-semibold">100 GCT Owned</p>
              {!has100GCT && <p className="text-xs text-gray-500">Locked</p>}
            </div>
            <div className={`p-4 rounded shadow ${hasVerified ? "bg-green-100" : "bg-gray-100"}`}>
              <p className="text-xl">🛠️</p>
              <p className="font-semibold">Verified a Project</p>
              {!hasVerified && <p className="text-xs text-gray-500">Locked</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}