import { useEffect, useState } from "react";
import { BrowserProvider, Contract, Log } from "ethers";
import erc20Abi from "../abis/CarbonCreditToken.json";

const ERC20_ADDRESS = "0x1A4e6170681F07C29B1999fAf08bA7eCd2632D2E";

// Extend the Log type to include the args property
interface EventLog extends Log {
  args: {
    to: string;
    amount: string;
  };
}

// Type guard to check if an event is an EventLog
function isEventLog(event: Log | EventLog): event is EventLog {
  return 'args' in event && event.args !== undefined;
}

export default function useCarbonChartData(account: string | null) {
  const [chartData, setChartData] = useState<{ date: string; credits: number }[]>([]);

  useEffect(() => {
    if (!account || !window.ethereum) return;

    const fetchEvents = async () => {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(ERC20_ADDRESS, erc20Abi, provider);

      const latestBlock = await provider.getBlockNumber();
      const fromBlock = latestBlock - 5000;

      const transferEvents = await contract.queryFilter("Transfer", fromBlock, latestBlock);

      // Filter for incoming transactions to the user
      const incoming = transferEvents.filter(
        (e): e is EventLog => isEventLog(e) && e.args.to.toLowerCase() === account.toLowerCase()
      );

      const dataMap: { [date: string]: number } = {};

      for (const event of incoming) {
        const block = await provider.getBlock(event.blockNumber);
        if (!block) continue;
        const date = new Date(block.timestamp * 1000).toISOString().split("T")[0];
        const value = Number(event.args.amount) / 1e18;
        dataMap[date] = (dataMap[date] || 0) + value;
      }

      const sorted = Object.entries(dataMap).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

      const formatted = sorted.map(([date, credits]) => ({ date, credits }));
      setChartData(formatted);
    };

    fetchEvents();
  }, [account]);

  return chartData;
}