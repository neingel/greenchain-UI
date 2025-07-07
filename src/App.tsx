import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Marketplace from "./pages/marketplace";
import VerificationExplorer from "./components/VerificationExplorer";
import AdminPanel from "./pages/adminpanel";
import AMMPanel from "./components/AMMPanel";
import Footer from "./components/footer";
import { useWallet } from "./context/walletcontext";
import { Button } from "./components/ui/button";

export default function App() {
  const { account, balance, provider,connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Layout wrapper */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4">
          <h2 className="text-2xl font-bold mb-6">GreenChain</h2>
          <ul className="space-y-4">
            <li><NavLink to="/dashboard" className="text-green-700">Dashboard</NavLink></li>
            <li><NavLink to="/marketplace" className="text-green-700">Marketplace</NavLink></li>
            <li><NavLink to="/verify" className="text-green-700">Verification Explorer</NavLink></li>
            <li><NavLink to="/amm" className="text-green-700">AMM / Swap</NavLink></li>
            <li><NavLink to="/admin" className="text-green-700">Admin/Issuer</NavLink></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            {account ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                <span>
                  Connected: {account} ({provider})
                </span>
                <span className="font-medium">ETH: {balance}</span>
                <Button onClick={disconnectWallet} variant="destructive">
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet}>Connect Wallet</Button>
            )}
          </div>

          {/* Routes */}
          <div className="flex-1">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/verify" element={<VerificationExplorer />} />
              <Route path="/amm" element={<AMMPanel />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}