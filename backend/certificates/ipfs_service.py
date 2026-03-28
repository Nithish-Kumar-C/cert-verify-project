"""
ipfs_service.py
Uploads certificate PDFs to IPFS via Pinata.
"""
import requests
from django.conf import settings


PINATA_PIN_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"


def _get_headers():
    return {
        "pinata_api_key":        settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_SECRET_KEY,
    }


def upload_pdf_to_ipfs(pdf_bytes: bytes, filename: str) -> str:
    """
    Upload a PDF to IPFS via Pinata.
    Returns the IPFS CID (e.g. 'QmXabc123...').
    """
    files    = {"file": (filename, pdf_bytes, "application/pdf")}
    response = requests.post(PINATA_PIN_URL, files=files, headers=_get_headers())
    response.raise_for_status()
    return response.json()["IpfsHash"]


def upload_metadata_to_ipfs(metadata: dict, name: str) -> str:
    """
    Upload certificate metadata JSON to IPFS.
    Returns the IPFS CID.
    """
    payload = {
        "pinataMetadata": {"name": name},
        "pinataContent":  metadata,
    }
    response = requests.post(
        PINATA_JSON_URL,
        json=payload,
        headers=_get_headers()
    )
    response.raise_for_status()
    return response.json()["IpfsHash"]


def get_ipfs_url(cid: str) -> str:
    """Return public IPFS gateway URL for a CID."""
    return f"https://gateway.pinata.cloud/ipfs/{cid}"
