// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title CertificateRegistry
/// @notice Issues and verifies academic certificates on-chain
contract CertificateRegistry {

    address public admin;

    struct Certificate {
        bytes32  certHash;
        string   studentName;
        string   course;
        string   grade;
        string   ipfsCID;       // IPFS CID of the PDF
        uint256  issuedAt;
        bool     isValid;
        bool     isRevoked;
    }

    // certHash => Certificate
    mapping(bytes32 => Certificate) private certificates;

    // Events
    event CertificateIssued(
        bytes32 indexed certHash,
        string studentName,
        string course,
        uint256 issuedAt
    );
    event CertificateRevoked(bytes32 indexed certHash, uint256 revokedAt);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Issue a new certificate
    function issueCertificate(
        bytes32 certHash,
        string memory studentName,
        string memory course,
        string memory grade,
        string memory ipfsCID
    ) external onlyAdmin {
        require(!certificates[certHash].isValid, "Certificate already exists");

        certificates[certHash] = Certificate({
            certHash:    certHash,
            studentName: studentName,
            course:      course,
            grade:       grade,
            ipfsCID:     ipfsCID,
            issuedAt:    block.timestamp,
            isValid:     true,
            isRevoked:   false
        });

        emit CertificateIssued(certHash, studentName, course, block.timestamp);
    }

    /// @notice Revoke an existing certificate
    function revokeCertificate(bytes32 certHash) external onlyAdmin {
        require(certificates[certHash].isValid, "Certificate not found");
        require(!certificates[certHash].isRevoked, "Already revoked");

        certificates[certHash].isRevoked = true;

        emit CertificateRevoked(certHash, block.timestamp);
    }

    /// @notice Verify a certificate — returns status string
    function verifyCertificate(bytes32 certHash)
        external
        view
        returns (
            string memory status,
            string memory studentName,
            string memory course,
            string memory grade,
            string memory ipfsCID,
            uint256 issuedAt
        )
    {
        Certificate memory cert = certificates[certHash];

        if (!cert.isValid) {
            return ("NOT_FOUND", "", "", "", "", 0);
        }
        if (cert.isRevoked) {
            return ("REVOKED", cert.studentName, cert.course, cert.grade, cert.ipfsCID, cert.issuedAt);
        }
        return ("VALID", cert.studentName, cert.course, cert.grade, cert.ipfsCID, cert.issuedAt);
    }

    /// @notice Transfer admin role to a new address
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
}
