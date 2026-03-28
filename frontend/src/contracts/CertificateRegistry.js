// CertificateRegistry — deployed ABI
// Update CONTRACT_ADDRESS after deploying with Foundry

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "certHash",    "type": "bytes32" },
      { "internalType": "string",  "name": "studentName", "type": "string"  },
      { "internalType": "string",  "name": "course",      "type": "string"  },
      { "internalType": "string",  "name": "grade",       "type": "string"  },
      { "internalType": "string",  "name": "ipfsCID",     "type": "string"  }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "certHash", "type": "bytes32" }],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "certHash", "type": "bytes32" }],
    "name": "verifyCertificate",
    "outputs": [
      { "internalType": "string",  "name": "status",      "type": "string"  },
      { "internalType": "string",  "name": "studentName", "type": "string"  },
      { "internalType": "string",  "name": "course",      "type": "string"  },
      { "internalType": "string",  "name": "grade",       "type": "string"  },
      { "internalType": "string",  "name": "ipfsCID",     "type": "string"  },
      { "internalType": "uint256", "name": "issuedAt",    "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "bytes32", "name": "certHash",    "type": "bytes32" },
      { "indexed": false, "internalType": "string",  "name": "studentName", "type": "string"  },
      { "indexed": false, "internalType": "string",  "name": "course",      "type": "string"  },
      { "indexed": false, "internalType": "uint256", "name": "issuedAt",    "type": "uint256" }
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "bytes32", "name": "certHash",   "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "revokedAt",  "type": "uint256" }
    ],
    "name": "CertificateRevoked",
    "type": "event"
  }
];
