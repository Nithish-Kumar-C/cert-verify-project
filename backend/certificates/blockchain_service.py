"""
blockchain_service.py
Handles all Ethers.js / Web3.py interactions with the smart contract.
"""
from web3 import Web3
from django.conf import settings
import json
import os

# ABI — only the functions we use
CONTRACT_ABI = json.loads("""
[
  {
    "inputs": [
      {"internalType": "bytes32", "name": "certHash",    "type": "bytes32"},
      {"internalType": "string",  "name": "studentName", "type": "string"},
      {"internalType": "string",  "name": "course",      "type": "string"},
      {"internalType": "string",  "name": "grade",       "type": "string"},
      {"internalType": "string",  "name": "ipfsCID",     "type": "string"}
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "certHash", "type": "bytes32"}],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "certHash", "type": "bytes32"}],
    "name": "verifyCertificate",
    "outputs": [
      {"internalType": "string",  "name": "status",      "type": "string"},
      {"internalType": "string",  "name": "studentName", "type": "string"},
      {"internalType": "string",  "name": "course",      "type": "string"},
      {"internalType": "string",  "name": "grade",       "type": "string"},
      {"internalType": "string",  "name": "ipfsCID",     "type": "string"},
      {"internalType": "uint256", "name": "issuedAt",    "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
""")


def get_web3():
    """Get Web3 instance connected to Sepolia."""
    w3 = Web3(Web3.HTTPProvider(settings.SEPOLIA_RPC_URL))
    if not w3.is_connected():
        raise ConnectionError("Cannot connect to Sepolia RPC")
    return w3


def get_contract():
    """Get contract instance."""
    w3 = get_web3()
    return w3.eth.contract(
        address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
        abi=CONTRACT_ABI
    )


def issue_on_blockchain(cert_hash_hex: str, student_name: str,
                        course: str, grade: str, ipfs_cid: str) -> str:
    """
    Store certificate hash on blockchain.
    Returns transaction hash.
    """
    w3        = get_web3()
    contract  = get_contract()
    account   = w3.eth.account.from_key(settings.ADMIN_PRIVATE_KEY)

    # Convert hex string to bytes32
    cert_hash_bytes = bytes.fromhex(cert_hash_hex.replace("0x", ""))

    tx = contract.functions.issueCertificate(
        cert_hash_bytes,
        student_name,
        course,
        grade,
        ipfs_cid
    ).build_transaction({
        "from":     account.address,
        "nonce":    w3.eth.get_transaction_count(account.address),
        "gas":      500000,
        "gasPrice": w3.eth.gas_price*2,
    })

    signed = w3.eth.account.sign_transaction(tx, settings.ADMIN_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    return receipt.transactionHash.hex()


def revoke_on_blockchain(cert_hash_hex: str) -> str:
    """
    Revoke certificate on blockchain.
    Returns transaction hash.
    """
    w3        = get_web3()
    contract  = get_contract()
    account   = w3.eth.account.from_key(settings.ADMIN_PRIVATE_KEY)

    cert_hash_bytes = bytes.fromhex(cert_hash_hex.replace("0x", ""))

    tx = contract.functions.revokeCertificate(cert_hash_bytes).build_transaction({
        "from":     account.address,
        "nonce":    w3.eth.get_transaction_count(account.address),
        "gas":      100000,
        "gasPrice": w3.eth.gas_price,
    })

    signed  = w3.eth.account.sign_transaction(tx, settings.ADMIN_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    return receipt.transactionHash.hex()


def verify_on_blockchain(cert_hash_hex: str) -> dict:
    """
    Verify certificate on blockchain.
    Returns dict with status and certificate data.
    """
    contract        = get_contract()
    cert_hash_bytes = bytes.fromhex(cert_hash_hex.replace("0x", ""))

    result = contract.functions.verifyCertificate(cert_hash_bytes).call()

    return {
        "status":       result[0],
        "student_name": result[1],
        "course":       result[2],
        "grade":        result[3],
        "ipfs_cid":     result[4],
        "issued_at":    result[5],
    }
