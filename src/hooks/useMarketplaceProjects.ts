// hooks/useMarketplaceProjects.ts
import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import metadataAbi from "../abis/CarbonCreditMetadata.json";

const METADATA_ADDRESS = "0xe112d5dcf4Af5E0F61FbD1a12aEf876503B7CC31";

export interface Project {
    tokenId: number;
    name: string;
    image: string;
    description: string;
    isApproved: boolean;
  }
  
  export default function useMarketplaceProjects(): Project[] {
    const [projects, setProjects] = useState<Project[]>([]);
  
    useEffect(() => {
      const fetchProjects = async () => {
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
  
        // Step 2: Fetch all project data in parallel
        const projectData = await Promise.all(
          tokenIds.map(async (tokenId) => {
            try {
              const [uri, isApproved] = await Promise.all([
                contract.uri(tokenId),
                contract.isCarbonCreditApproved(tokenId),
              ]);
  
              const metadata = await fetch(uri).then((res) => res.json());
  
              return {
                tokenId,
                name: metadata.name || `Project #${tokenId}`,
                image: metadata.image || "https://via.placeholder.com/150",
                description: metadata.description || "No description.",
                isApproved,
              };
            } catch (e) {
              return null;
            }
          })
        );
  
        setProjects(projectData.filter((p): p is Project => p !== null));
      };
  
      fetchProjects();
    }, []);
  
    return projects;
  }