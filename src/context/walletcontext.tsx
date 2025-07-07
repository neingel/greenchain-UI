// src/context/walletcontext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";
import toast from "react-hot-toast";

interface WalletContextType {
  account: string | null;
  balance: string;
  provider: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  balance: "0",
  provider: "Unknown",
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const userAccount = accounts[0];
        setAccount(userAccount);

        const provider = new BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(userAccount);
        const ethBalance = formatEther(balanceWei);
        setBalance(parseFloat(ethBalance).toFixed(4));

        toast.success(`Wallet connected (${getWalletProvider()})`);
      } catch (err) {
        toast.error("Connection failed");
        console.error("Wallet connection failed:", err);
      }
    } else {
      toast.error("Wallet not detected");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    toast("Wallet disconnected", { icon: "👋" });
  };

  const getWalletProvider = () => {
    if (window.ethereum?.isMetaMask) return "MetaMask";
    if (window.ethereum?.isCoinbaseWallet) return "Coinbase";
    return "Unknown";
  };

  const provider = getWalletProvider();

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const userAccount = accounts[0];
            setAccount(userAccount);

            const provider = new BrowserProvider(window.ethereum);
            const balanceWei = await provider.getBalance(userAccount);
            const ethBalance = formatEther(balanceWei);
            setBalance(parseFloat(ethBalance).toFixed(4));
          }
        } catch (err) {
          console.error("Silent wallet check failed:", err);
        }
      }
    };

    checkExistingConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        provider,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);