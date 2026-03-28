import { ethers } from "ethers";
import { authAPI } from "./api";

// ── Connect MetaMask ──────────────────────────────────────────
export async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install MetaMask!");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  const address  = await signer.getAddress();
  return { provider, signer, address };
}

// ── MetaMask Login ────────────────────────────────────────────
export async function loginWithMetaMask() {
  const { signer, address } = await connectMetaMask();

  // Message to sign (unique per session)
  const message = `Login to CertVerify\nAddress: ${address}\nTime: ${Date.now()}`;

  // MetaMask popup appears — user clicks Sign
  const signature = await signer.signMessage(message);

  // Send to Django backend
  const response = await authAPI.metamaskLogin({ address, message, signature });

  const { tokens, user } = response.data;
  localStorage.setItem("access_token",  tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);

  return { tokens, user, address };
}

// ── Verify Certificate on Chain ───────────────────────────────
export async function verifyOnChain(certHash) {
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  const RPC_URL          = import.meta.env.VITE_SEPOLIA_RPC_URL;

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const ABI = [
    "function verifyCertificate(bytes32 certHash) view returns (string status, string studentName, string course, string grade, string ipfsCID, uint256 issuedAt)"
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  // Convert hex string to bytes32
  const hashBytes = ethers.zeroPadValue(
    ethers.getBytes("0x" + certHash.replace("0x", "")),
    32
  );

  const result = await contract.verifyCertificate(hashBytes);

  return {
    status:      result[0],
    studentName: result[1],
    course:      result[2],
    grade:       result[3],
    ipfsCID:     result[4],
    issuedAt:    Number(result[5]),
  };
}

// ── Short Address ─────────────────────────────────────────────
export function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
