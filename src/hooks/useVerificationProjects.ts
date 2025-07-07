// hooks/useVerificationProjects.ts
import { useEffect, useState } from "react";
import { Contract, BrowserProvider } from "ethers";
import metadataAbi from "../abis/CarbonCreditMetadata.json";

const METADATA_ADDRESS = "0xe112d5dcf4Af5E0F61FbD1a12aEf876503B7CC31";

export interface VerificationProject {
  tokenId: number;
  name: string;
  image: string;
  description: string;
  isApproved: boolean;
  isRetired: boolean;
}

export default function useVerificationProjects(): VerificationProject[] {
  const [projects, setProjects] = useState<VerificationProject[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(METADATA_ADDRESS, metadataAbi, provider);

      const existence = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          contract.doesTokenExist(i).then((exists) => (exists ? i : null))
        )
      );

      const tokenIds = existence.filter((id): id is number => id !== null);

      const projectDetails = await Promise.all(
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
              description: metadata.description || "No description.",
              isApproved,
              isRetired,
            };
          } catch {
            return null;
          }
        })
      );

      setProjects(projectDetails.filter((p): p is VerificationProject => p !== null));
    };

    fetchProjects();
  }, []);

  return projects;
}
