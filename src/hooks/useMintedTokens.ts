// hooks/useMintedTokens.ts
import { useEffect, useState } from "react";
import { Contract, BrowserProvider } from "ethers";
import metadataAbi from "../abis/CarbonCreditMetadata.json";

const METADATA_ADDRESS = "0xe112d5dcf4Af5E0F61FbD1a12aEf876503B7CC31";

export interface MintedToken {
  tokenId: number;
  name: string;
  image: string;
  description: string;
  isApproved: boolean;
  isRetired: boolean;
}

export default function useMintedTokens(): MintedToken[] {
    const [tokens, setTokens] = useState<MintedToken[]>([]);
  
    useEffect(() => {
      const fetchTokens = async () => {
        if (!window.ethereum) return;
  
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(METADATA_ADDRESS, metadataAbi, provider);
  
        // Step 1: Check which tokenIds exist
        const checkExistence = await Promise.all(
          Array.from({ length: 50 }, (_, i) =>
            contract.doesTokenExist(i).then((exists) => (exists ? i : null))
          )
        );
  
        const tokenIds = checkExistence.filter((id): id is number => id !== null);
  
        // Step 2: Fetch all token data in parallel
        const tokenData = await Promise.all(
          tokenIds.map(async (tokenId) => {
            try {
              const [uri, isApproved, isRetired] = await Promise.all([
                contract.uri(tokenId),
                contract.isCarbonCreditApproved(tokenId),
                contract.isCarbonCreditRetired(tokenId),
              ]);
  
              const metadata = await fetch(uri).then((res) => res.json());
  
              return {
                tokenId,
                name: metadata.name || `Token #${tokenId}`,
                image: metadata.image || "",
                description: metadata.description || "No description available.",
                isApproved,
                isRetired,
              };
            } catch (e) {
              return null;
            }
          })
        );
  
        setTokens(tokenData.filter((t): t is MintedToken => t !== null));
      };
  
      fetchTokens();
    }, []);
  
    return tokens;
  }