# ⛓ Blockchain — Solidity + Foundry

## Setup

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install forge-std library
forge install foundry-rs/forge-std --no-commit
```

## Run Tests

```bash
forge test -v
```

Expected output:
```
[PASS] test_IssueCertificate()
[PASS] test_IssueEmitsEvent()
[PASS] test_CannotIssueByNonAdmin()
[PASS] test_CannotIssueDuplicate()
[PASS] test_VerifyValidCertificate()
[PASS] test_VerifyFakeCertificate()
[PASS] test_RevokeCertificate()
[PASS] test_RevokeEmitsEvent()
[PASS] test_CannotRevokeByNonAdmin()
[PASS] test_CannotRevokeNonExistentCert()
[PASS] test_CannotRevokeAlreadyRevoked()
[PASS] test_TransferAdmin()
```

## Deploy to Sepolia

```bash
# 1. Copy and fill .env
cp .env.example .env

# 2. Deploy
forge script script/Deploy.s.sol:DeployCertificateRegistry \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# 3. Copy the deployed address from output
# Update backend/.env  → CONTRACT_ADDRESS=0x...
# Update frontend/.env → VITE_CONTRACT_ADDRESS=0x...
```

## Get Sepolia ETH (free)

- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

## Get Infura RPC URL (free)

1. Go to https://infura.io
2. Create project → Ethereum → Sepolia endpoint
3. Copy the HTTPS URL → paste into .env

## Contract Functions

```solidity
// Issue certificate — admin only
issueCertificate(bytes32 hash, string name, string course, string grade, string ipfsCID)

// Verify certificate — anyone can call (free, no gas)
verifyCertificate(bytes32 hash)
  returns (status, studentName, course, grade, ipfsCID, issuedAt)

// Revoke certificate — admin only
revokeCertificate(bytes32 hash)

// Transfer admin — admin only
transferAdmin(address newAdmin)
```
