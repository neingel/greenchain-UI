import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import useMarketplaceProjects from "../hooks/useMarketplaceProjects";

interface CoinCapAsset {
  id: string;
  priceUsd: string;
  changePercent24Hr: string;
}

export default function Marketplace() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [ethToBuy, setEthToBuy] = useState("");
  const [gctReceived, setGctReceived] = useState<number | null>(null);
  const [ethAmount, setEthAmount] = useState("");
  const [gctAmount, setGctAmount] = useState("");
  const projects = useMarketplaceProjects();

  const gctRate = 0.05;

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          "https://api.coincap.io/v2/assets?ids=ethereum,bitcoin,usd-coin,polygon"
        );
        const { data } = await res.json();

        const parsed = data.reduce((acc: Record<string, number>, coin: CoinCapAsset) => {
          const price = parseFloat(coin.priceUsd);
          const change = parseFloat(coin.changePercent24Hr);

          if (!isNaN(price)) acc[coin.id] = price;
          if (!isNaN(change)) acc[`change-${coin.id}`] = change;

          return acc;
        }, {});

        setPrices(parsed);
      } catch (err) {
        console.error("Error fetching CoinCap prices:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = () => {
    const eth = parseFloat(ethToBuy);
    if (!isNaN(eth)) {
      setGctReceived(eth / gctRate);
    }
  };

  const handleEthToGct = () => {
    const eth = parseFloat(ethAmount);
    if (!isNaN(eth)) {
      setGctAmount((eth / gctRate).toFixed(2));
    }
  };

  const handleGctToEth = () => {
    const gct = parseFloat(gctAmount);
    if (!isNaN(gct)) {
      setEthAmount((gct * gctRate).toFixed(4));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>

      {/* Live Market Rates */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">📊 Live Market Rates (USD)</h2>
          {prices.ethereum && prices.bitcoin && prices.polygon && prices["usd-coin"] ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { id: "ethereum", label: "ETH", emoji: "🟣" },
                { id: "bitcoin", label: "BTC", emoji: "🟠" },
                { id: "polygon", label: "MATIC", emoji: "🔷" },
                { id: "usd-coin", label: "USDC", emoji: "💵" },
              ].map((coin) => {
                const price = prices[coin.id];
                const change = prices[`change-${coin.id}`];

                return (
                  <li key={coin.id} className="flex flex-col">
                    <span className="font-semibold">
                      {coin.emoji} {coin.label}: $
                      {price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    {change !== undefined && (
                      <span className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Loading prices...</p>
          )}
        </CardContent>
      </Card>

      {/* Buy GCT Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">🛒 Buy GCT</h2>
          <label className="text-sm text-gray-700">Amount in ETH</label>
          <Input
            placeholder="e.g. 0.5"
            value={ethToBuy}
            onChange={(e) => setEthToBuy(e.target.value)}
          />
          <Button onClick={handleBuy}>Buy</Button>
          {gctReceived && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-700">
              You'll receive approximately <strong>{gctReceived.toFixed(2)} GCT</strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ETH ↔ GCT Converter */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">🔁 ETH ↔ GCT Converter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">ETH</label>
              <Input
                placeholder="Enter ETH"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
              />
              <Button onClick={handleEthToGct}>Convert to GCT</Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">GCT</label>
              <Input
                placeholder="Enter GCT"
                value={gctAmount}
                onChange={(e) => setGctAmount(e.target.value)}
              />
              <Button onClick={handleGctToEth}>Convert to ETH</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Marketplace with Images */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">🧪 Verified Projects for Sale</h2>
          <div className="space-y-4">
          {projects.map((project) => {
            const status = project.isApproved
              ? "Verified"
              : "Pending"; // Optional: add `isRejected` if you track that

            const statusStyles = project.isApproved
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800";

            return (
              <div
                key={project.tokenId}
                className="border p-4 rounded flex gap-4 items-start"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <p className="text-sm text-gray-600">Token ID: {project.tokenId}</p>
                  <Button
                    className="mt-2"
                    disabled={!project.isApproved}
                    variant={project.isApproved ? "default" : "ghost"}
                  >
                    {project.isApproved ? "Buy Credits" : "Unavailable"}
                  </Button>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${statusStyles}`}
                >
                  {status}
                </span>
              </div>
            );
          })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}