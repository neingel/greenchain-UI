// hooks/useDashboardData.ts
import { useEffect, useState } from "react";
import { Contract, BrowserProvider } from "ethers";
import erc20Abi from "../abis/CarbonCreditToken.json";
import erc1155Abi from "../abis/CarbonCreditMetadata.json";

const ERC20_ADDRESS = "0x1A4e6170681F07C29B1999fAf08bA7eCd2632D2E";
const METADATA_ADDRESS = "0xe112d5dcf4Af5E0F61FbD1a12aEf876503B7CC31";

export default function useDashboardData(account: string | null) {
  const [gctBalance, setGctBalance] = useState("0");
  const [allocationData, setAllocationData] = useState([
    { name: "Verified", value: 0 },
    { name: "Marketplace", value: 0 },
    { name: "Retired", value: 0 },
  ]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!account || !window.ethereum) return;

    const fetchData = async () => {
      const provider = new BrowserProvider(window.ethereum);
      const erc20 = new Contract(ERC20_ADDRESS, erc20Abi, provider);
      const erc1155 = new Contract(METADATA_ADDRESS, erc1155Abi, provider);

      // Fetch ERC20 balance
      const balance = await erc20.balanceOf(account);
      setGctBalance((Number(balance) / 1e18).toFixed(2));

      // Fetch token allocation from ERC1155 tokenId scan (e.g. 0-20)
      let verified = 0, retired = 0, marketplace = 0;
      for (let i = 0; i < 20; i++) {
        try {
          const exists = await erc1155.doesTokenExist(i);
          if (!exists) continue;

          const approved = await erc1155.isCarbonCreditApproved(i);
          const retiredStatus = await erc1155.isCarbonCreditRetired(i);

          if (retiredStatus) retired++;
          else if (approved) verified++;
          else marketplace++;
        } catch (err) {
          continue;
        }
      }
      setAllocationData([
        { name: "Verified", value: verified },
        { name: "Marketplace", value: marketplace },
        { name: "Retired", value: retired },
      ]);

      // Optional: Simulated transactions
      setTransactions([
        { label: `You hold 100 GCT`, timestamp: "Now" },
        { label: `Verified ${verified} tokens`, timestamp: "Today" },
        { label: `Retired ${retired} tokens`, timestamp: "This week" },
      ]);
    };

    fetchData();
  }, [account]);

  return { gctBalance, allocationData, transactions };
}
