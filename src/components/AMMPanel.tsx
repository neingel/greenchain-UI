import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import factoryAbi from "../abis/CarbonAMMFactory.json";
import zapAbi from "../abis/CarbonZap.json";
import cpammAbi from "../abis/CPAMM.json";
import erc20Abi from "../abis/CarbonCreditToken.json";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const FACTORY_ADDRESS = "0xC2a089d36EfB8c9471f7CeE753C60Bc5Abe1c685";
const ZAP_ADDRESS = "0x9E1DCB22a8CAE6ca07023716Ce9397F99FEAbC25";
const STABLECOIN_ADDRESS = "0x84Fdc6A12077f1C9C5730428A74bfE0F872b677b"; // e.g., mock USDC

export default function AMMPanel() {
  const [carbonToken, setCarbonToken] = useState("");
  const [zapAmount, setZapAmount] = useState("");
  const [swapAmount, setSwapAmount] = useState("");
  const [pools, setPools] = useState<{ carbonToken: string; pool: string }[]>([]);
  const [selectedPool, setSelectedPool] = useState("");
  const [txMessage, setTxMessage] = useState("");
  const [lpBalance, setLpBalance] = useState<string | null>(null);
  const [poolShare, setPoolShare] = useState<string | null>(null);
  const [reserves, setReserves] = useState<{ token0: string; token1: string } | null>(null);


  useEffect(() => {
    if (selectedPool) {
      fetchLpData();
    }
    fetchPools();
  }, [selectedPool]);

  const fetchLpData = async () => {
    try {
      // Fake data instead of onchain calls
      const fakeBalance = 123.4567;     // LP token balance
      const fakePoolShare = 7.89;       // percentage of pool
      const fakeReserves = {
        token0: 12345.67,               // reserve of token0
        token1: 89012.34,               // reserve of token1
      };
  
      // Set fake values in UI
      setLpBalance(fakeBalance.toFixed(4));
      setPoolShare(fakePoolShare.toFixed(2) + "%");
      setReserves({
        token0: fakeReserves.token0.toFixed(2),
        token1: fakeReserves.token1.toFixed(2),
      });
    } catch (err) {
      console.error("Failed to fetch LP data", err);
    }
  };
  

  const fetchPools = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const factory = new Contract(FACTORY_ADDRESS, factoryAbi, provider);
      const poolEvents = await factory.queryFilter("PoolCreated");
      const found: { carbonToken: string; pool: string }[] = poolEvents.map((e) => {
        if ("args" in e && Array.isArray(e.args)) {
          return {
            carbonToken: e.args[0],
            pool: e.args[1],
          };
        }
        throw new Error("Unexpected event format");
      });
      setPools(found);
    } catch (err) {
      console.error("Failed to fetch pools", err);
    }
  };

  const handleZap = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      // Contracts
      const zap = new Contract(ZAP_ADDRESS, zapAbi, signer);
      const carbon = new Contract(carbonToken, erc20Abi, signer);
  
      // Hardcode 18 decimals by multiplying directly
      const rawInput = parseFloat(zapAmount); // user enters "0.01"
      const amount = BigInt(Math.floor(rawInput * 1e18)); // 0.01 => 10000000000000000n
  
      // Approve if needed
      const userAddress = await signer.getAddress();
      const allowance = await carbon.allowance(userAddress, ZAP_ADDRESS);
  
      if (allowance < amount) {
        const approveTx = await carbon.approve(ZAP_ADDRESS, amount);
        await approveTx.wait();
      }
  
      // Call zapIn
      const tx = await zap.zapIn(carbonToken, amount);
      await tx.wait();
  
      setTxMessage(`✅ Zapped ${zapAmount} into liquidity.`);
    } catch (err) {
      console.error(err);
      setTxMessage("❌ Zap failed. See console.");
    }
  };
  

  const handleSwap = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pool = new Contract(selectedPool, cpammAbi, signer);
      const carbon = new Contract(carbonToken, erc20Abi, signer);
      const amount = BigInt(parseFloat(swapAmount) * 1e18);

      const tokenIn = carbonToken;
      const allowance = await carbon.allowance(await signer.getAddress(), selectedPool);
      if (allowance < amount) {
        const approveTx = await carbon.approve(selectedPool, amount);
        await approveTx.wait();
      }

      const tx = await pool.swap(tokenIn, amount);
      await tx.wait();
      setTxMessage(`✅ Swapped ${swapAmount} tokens.`);
    } catch (err) {
      console.error(err);
      setTxMessage("❌ Swap failed. See console.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🌊 AMM System</h1>

      {/* Zap-In Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">⚡ Zap In (Provide Liquidity)</h2>
          <Input
            placeholder="Carbon Token Address"
            value={carbonToken}
            onChange={(e) => setCarbonToken(e.target.value)}
          />
          <Input
            placeholder="Amount to Zap (Carbon Token)"
            value={zapAmount}
            onChange={(e) => setZapAmount(e.target.value)}
          />
          <Button onClick={handleZap}>Zap Into Pool</Button>
        </CardContent>
      </Card>

      {/* Swap Interface */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">🔁 Swap Carbon Credits</h2>
          <label className="text-sm text-gray-700">Select a Pool</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedPool}
            onChange={(e) => setSelectedPool(e.target.value)}
          >
            <option value="">-- Select --</option>
            {pools.map((p, idx) => (
              <option key={idx} value={p.pool}>
                {p.carbonToken.slice(0, 6)}... ↔ Stablecoin
              </option>
            ))}
          </select>

          <Input
            placeholder="Amount to Swap"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
          />
          <Button onClick={handleSwap} disabled={!selectedPool}>
            Swap
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">📊 LP Dashboard</h2>
            {lpBalance && poolShare && reserves ? (
            <div className="space-y-2 text-sm text-gray-700">
                <p>💰 <strong>Your LP Tokens:</strong> {lpBalance}</p>
                <p>📈 <strong>Your Pool Share:</strong> {poolShare}</p>
                <p>🧪 <strong>Pool Reserves:</strong></p>
                <ul className="pl-4">
                <li>Token0 (Carbon): {reserves.token0}</li>
                <li>Token1 (Stablecoin): {reserves.token1}</li>
                </ul>
            </div>
            ) : (
            <p className="text-sm text-gray-500">Select a pool to view your LP details.</p>
            )}
        </CardContent>
        </Card>

      {/* Pool List */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">📄 Available Pools</h2>
          <ul className="text-sm text-gray-700">
            {pools.length === 0 && <li>No pools found</li>}
            {pools.map((p, idx) => (
              <li key={idx} className="border-b py-2">
                Carbon Token: {p.carbonToken} <br />
                Pool Address: {p.pool}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Transaction Message */}
      {txMessage && <p className="text-sm text-green-600">{txMessage}</p>}
    </div>
  );
}
