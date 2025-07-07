import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Contract, BrowserProvider } from "ethers";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import useMintedTokens from "../hooks/useMintedTokens";

import metadataAbi from "../abis/CarbonCreditMetadata.json";
import erc20Abi from "../abis/CarbonCreditToken.json";

const METADATA_ADDRESS = "0xe112d5dcf4Af5E0F61FbD1a12aEf876503B7CC31"; // replace with actual ERC1155
const ERC20_ADDRESS = "0x1A4e6170681F07C29B1999fAf08bA7eCd2632D2E"; // replace with actual ERC20

export default function AdminPanel() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isIssuer, setIsIssuer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApprover, setIsApprover] = useState(false);
  const [isBridge, setIsBridge] = useState(false);
  const [txMessage, setTxMessage] = useState("");
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [balances, setBalances] = useState<Record<number, number>>({});
  const mintedTokens = useMintedTokens();

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // ERC1155 Minting
  const [mintData, setMintData] = useState({
    tokenId: "",
    projectName: "",
    standard: "",
    vintageYear: "",
    location: "",
    tokenURI: "",
    amount: "",
  });

  // ERC1155 Approval
  const [statusTokenId, setStatusTokenId] = useState("");

  // ERC20 Minting
  const [mintTokenId, setMintTokenId] = useState("");
  const [erc1155Balance, setErc1155Balance] = useState<number | null>(null);
  const [approvedStatus, setApprovedStatus] = useState(false);
  const [mintAmount, setMintAmount] = useState("");

  // Role Management
  const [roleType, setRoleType] = useState("ISSUER_ROLE");
  const [roleAction, setRoleAction] = useState<"grant" | "revoke">("grant");
  const [targetAddress, setTargetAddress] = useState("");
  const [roleMessage, setRoleMessage] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts: string[]) => {
          setAvailableAccounts(accounts);
          if (accounts.length > 0) checkWalletRoles(accounts[0]);
        });
  
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAvailableAccounts(accounts);
        if (accounts.length > 0) checkWalletRoles(accounts[0]);
      });
  
      window.ethereum.on("disconnect", () => {
        setIsIssuer(false);
        setIsAdmin(false);
        setIsBridge(false);
        setIsApprover(false);
        setAvailableAccounts([]);
      });
    }
  }, []);

  useEffect(() => {
    if (!walletAddress || mintedTokens.length === 0) return;
  
    const fetchBalances = async () => {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(METADATA_ADDRESS, metadataAbi, provider);
      const results: Record<number, number> = {};
  
      for (const token of mintedTokens) {
        try {
          const bal = await contract.balanceOf(walletAddress, token.tokenId);
          results[token.tokenId] = Number(bal);
        } catch {
          results[token.tokenId] = 0;
        }
      }
  
      setBalances(results);
    };
  
    fetchBalances();
  }, [walletAddress, mintedTokens]);

  const checkWalletRoles = async (customAddress?: string) => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = customAddress || (await signer.getAddress());
  
    setWalletAddress(address);
  
    const erc1155 = new Contract(METADATA_ADDRESS, metadataAbi, provider);
    const erc20 = new Contract(ERC20_ADDRESS, erc20Abi, provider);
  
    const issuerRole = await erc1155.ISSUER_ROLE();
    const admin = await erc1155.hasRole(DEFAULT_ADMIN_ROLE, address);
    const issuer = await erc1155.hasRole(issuerRole, address);
  
    const bridgeRole = await erc20.BRIDGE_ROLE();
    const bridge = await erc20.hasRole(bridgeRole, address);
  
    const approverRole = await erc1155.APPROVER_ROLE();
    const approver = await erc1155.hasRole(approverRole, address);
  
    setIsAdmin(admin);
    setIsIssuer(issuer);
    setIsBridge(bridge);
    setIsApprover(approver);
  };

  const mintMetadata = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(METADATA_ADDRESS, metadataAbi, signer);
  
      const {
        tokenId,
        projectName,
        standard,
        vintageYear,
        location,
        tokenURI,
        amount,
      } = mintData;
  
      const tx = await contract.mintMetadata(
        await signer.getAddress(),
        parseInt(tokenId),
        projectName,
        standard,
        parseInt(vintageYear),
        location,
        tokenURI,
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [parseInt(amount)]) // encoded amount
      );
  
      await tx.wait();
      setTxMessage(`✅ Minted ${amount} ERC1155 tokens (Token ID ${tokenId})`);
    } catch (err) {
      console.error("ERC1155 mintMetadata failed", err);
      setTxMessage("❌ Mint metadata failed.");
    }
  };

  const approveToken = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(METADATA_ADDRESS, metadataAbi, signer);

      const tx = await contract.approveCarbonCredit(parseInt(statusTokenId));
      await tx.wait();
      setTxMessage(`✅ Approved ERC1155 Token ID ${statusTokenId}`);
    } catch (err) {
      console.error("Approval failed", err);
      setTxMessage("❌ Approval failed.");
    }
  };

  const retireToken = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(METADATA_ADDRESS, metadataAbi, signer);
  
      const tx = await contract.markCarbonCreditRetired(parseInt(statusTokenId));
      await tx.wait();
      setTxMessage(`♻️ Retired ERC1155 Token ID ${statusTokenId}`);
    } catch (err) {
      console.error("Retirement failed", err);
      setTxMessage("❌ Retirement failed.");
    }
  };

  const checkApprovalAndBalance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const erc1155 = new Contract(METADATA_ADDRESS, metadataAbi, provider);
  
    // 🔍 Add existence check here
    const exists = await erc1155.doesTokenExist(mintTokenId);
    if (!exists) {
      setApprovedStatus(false);
      setErc1155Balance(null);
      alert("❌ Token does not exist");
      return;
    }
  
    const approved = await erc1155.isCarbonCreditApproved(mintTokenId);
    setApprovedStatus(approved);
  
    const signer = await provider.getSigner();
    const balance = await erc1155.balanceOf(await signer.getAddress(), mintTokenId);
    setErc1155Balance(Number(balance));
  };
  

  const mintERC20 = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
  
      const erc20 = new Contract(ERC20_ADDRESS, erc20Abi, signer);
      const erc1155 = new Contract(METADATA_ADDRESS, metadataAbi, signer);
  
      const tokenId = parseInt(mintTokenId);
      const amountToMint = parseInt(mintAmount);
  
      // ✅ Check: token is approved
      const approved = await erc1155.isCarbonCreditApproved(tokenId);
      if (!approved) {
        setTxMessage("❌ Token is not approved for ERC20 minting.");
        return;
      }
  
      // ✅ Check: balance
      const balance = await erc1155.balanceOf(address, tokenId);
      if (balance < amountToMint) {
        setTxMessage(`❌ You only own ${balance} ERC1155 tokens. Cannot mint ${amountToMint}.`);
        return;
      }
  
      // ✅ Check: BRIDGE_ROLE
      const bridgeRole = await erc20.BRIDGE_ROLE();
      const hasBridge = await erc20.hasRole(bridgeRole, address);
      if (!hasBridge) {
        setTxMessage("❌ You do not have BRIDGE_ROLE on ERC20 contract.");
        return;
      }
  
      // ✅ Check/set approval to allow ERC20 to transfer user's ERC1155
      const isApprovedForAll = await erc1155.isApprovedForAll(address, ERC20_ADDRESS);
      if (!isApprovedForAll) {
        const approvalTx = await erc1155.setApprovalForAll(ERC20_ADDRESS, true);
        await approvalTx.wait();
        setTxMessage("✅ ERC1155 approved for ERC20 contract. Continuing to mint...");
      }
  
      // 🔁 Mint ERC20
      const tx = await erc20.mintWithMetadata(address, amountToMint, tokenId);
      await tx.wait();
  
      setTxMessage(`✅ Minted ${amountToMint} ERC20 tokens from Token ID ${tokenId}`);
    } catch (err) {
      console.error("ERC20 mint failed", err);
      setTxMessage("❌ Transaction reverted. Check contract conditions and role permissions.");
    }
  };
  
  const debugMintingConditions = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
  
      const erc1155 = new Contract(METADATA_ADDRESS, metadataAbi, provider);
  
      const tokenId = parseInt(mintTokenId);
      const balance = await erc1155.balanceOf(address, tokenId);
      const exists = await erc1155.doesTokenExist(tokenId);
      const isApproved = await erc1155.isCarbonCreditApproved(tokenId);
      const isRetired = await erc1155.isCarbonCreditRetired(tokenId);
      const approvedForAll = await erc1155.isApprovedForAll(address, ERC20_ADDRESS);
  
      console.log("🧪 Minting Conditions Debug:");
      console.log("Token ID:", tokenId);
      console.log("• exists:", exists);
      console.log("• isApproved:", isApproved);
      console.log("• isRetired:", isRetired);
      console.log("• balance:", balance.toString());
      console.log("• setApprovalForAll:", approvedForAll);
    } catch (err) {
      console.error("❌ Error during debugMintingConditions", err);
    }
  };  

  const handleRoleChange = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const isBridgeRole = roleType === "BRIDGE_ROLE";
  
      const targetContract = isBridgeRole
        ? new Contract(ERC20_ADDRESS, erc20Abi, signer)
        : new Contract(METADATA_ADDRESS, metadataAbi, signer);
  
      const roleHash = ethers.id(roleType); // ✅ Safe for all roles
  
      const tx =
        roleAction === "grant"
          ? await targetContract.grantRole(roleHash, targetAddress)
          : await targetContract.revokeRole(roleHash, targetAddress);
  
      await tx.wait();
      setRoleMessage(`✅ ${roleAction}ed ${roleType} for ${targetAddress}`);
    } catch (err) {
      console.error("Role change failed", err);
      setRoleMessage("❌ Failed to change role.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Connected Wallet:</label>
        <select
          className="border p-1 rounded text-sm"
          value={walletAddress}
          onChange={(e) => checkWalletRoles(e.target.value)}
        >
          {availableAccounts.map((acc) => (
            <option key={acc} value={acc}>
              {acc}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm">Issuer: {isIssuer ? "✅" : "❌"} | Admin: {isAdmin ? "✅" : "❌"} | Approver: {isApprover ? "✅" : "❌"} |  Bridge: {isBridge ? "✅" : "❌"}</p>

      {/* ─── List Minted Tokens ───────────────────── */}
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-xl font-semibold">📦 Minted ERC1155 Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mintedTokens.map((token) => (
              <div key={token.tokenId} className="border p-4 rounded shadow space-y-2">
                <img src={token.image} alt={token.name} className="w-full h-40 object-cover rounded" />
                <h3 className="font-semibold text-lg">{token.name}</h3>
                <p className="text-sm text-gray-600">ID: {token.tokenId}</p>
                <p className="text-sm text-gray-500">{token.description}</p>
                <p className="text-sm">
                  Status: {token.isRetired ? "♻ Retired" : token.isApproved ? "✅ Approved" : "🕒 Pending"}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Balance: {balances[token.tokenId] || 0}
                </p>
                <div className="flex gap-2 mt-2">
                  {!token.isApproved && !token.isRetired && (
                    <Button
                      onClick={() => {
                        setStatusTokenId(token.tokenId.toString());
                        approveToken();
                      }}
                    >
                      Approve
                    </Button>
                  )}
                  {!token.isRetired && (
                    <Button
                    onClick={() => {
                      setStatusTokenId(token.tokenId.toString());
                      retireToken();
                    }}
                  >
                    Retire
                  </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Mint ERC1155 ───────────────────── */}
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-xl font-semibold">🧾 Mint ERC1155 Token</h2>
          {Object.entries(mintData).map(([key, val]) => (
            <Input
              key={key}
              placeholder={key}
              value={val}
              onChange={(e) => setMintData((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          ))}
          <Button onClick={mintMetadata} disabled={!isIssuer}>Mint Metadata</Button>
        </CardContent>
      </Card>

      {/* ─── Mint ERC20 ────────────────────── */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">🔁 Mint ERC20 from Approved ERC1155</h2>
          <Input
            placeholder="ERC1155 Token ID"
            value={mintTokenId}
            onChange={(e) => setMintTokenId(e.target.value)}
          />
          <Button onClick={checkApprovalAndBalance}>Check Status</Button>

          {erc1155Balance !== null && (
            <p className="text-sm"> Balance: {erc1155Balance} | Approved: {approvedStatus ? "✅" : "❌"}</p>
          )}

          <Input
            placeholder="Amount to Mint"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
          />
          <Button
            onClick={mintERC20}
            disabled={!approvedStatus || !isBridge || !erc1155Balance || parseInt(erc1155Balance as any) < parseInt(mintAmount)}
          >
            Mint ERC20
          </Button>

          <Button variant="ghost" onClick={debugMintingConditions}>
            🧪 Debug Mint Conditions
          </Button>
        </CardContent>
      </Card>

      {/* ─── Manage Roles ───────────────────── */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">🔐 Manage Roles</h2>
          <div className="flex flex-wrap gap-2">
            <select className="border p-2 rounded" value={roleType} onChange={(e) => setRoleType(e.target.value)}>
              <option value="ISSUER_ROLE">ISSUER_ROLE</option>
              <option value="APPROVER_ROLE">APPROVER_ROLE</option>
              <option value="BRIDGE_ROLE">BRIDGE_ROLE</option>
            </select>
            <select className="border p-2 rounded" value={roleAction} onChange={(e) => setRoleAction(e.target.value as "grant" | "revoke")}>
              <option value="grant">Grant</option>
              <option value="revoke">Revoke</option>
            </select>
            <Input
              placeholder="Target Wallet Address"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
            />
            <Button onClick={handleRoleChange}>{roleAction === "grant" ? "Grant" : "Revoke"} Role</Button>
          </div>
          {roleMessage && <p className="text-sm text-green-700">{roleMessage}</p>}
        </CardContent>
      </Card>

      {txMessage && <p className="text-sm text-green-700">{txMessage}</p>}
    </div>
  );
}