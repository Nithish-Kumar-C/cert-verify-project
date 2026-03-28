// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CertificateRegistry.sol";

contract CertificateRegistryTest is Test {

    // Event declarations for testing
    event CertificateIssued(bytes32 indexed certHash, string studentName, string course, uint256 issuedAt);
    event CertificateRevoked(bytes32 indexed certHash, uint256 revokedAt);

    CertificateRegistry registry;
    address admin   = address(1);
    address hacker  = address(2);

    bytes32 raviHash    = keccak256("Ravi+CSE+AnnaUniv+2024");
    bytes32 priyaHash   = keccak256("Priya+ECE+AnnaUniv+2024");
    bytes32 fakeHash    = keccak256("Ramesh+MBA+IIM+2024");

    function setUp() public {
        vm.prank(admin);
        registry = new CertificateRegistry();
    }

    // ─── Issue Tests ────────────────────────────────────────

    function test_IssueCertificate() public {
        vm.prank(admin);
        registry.issueCertificate(
            raviHash,
            "Ravi Kumar",
            "B.E. Computer Science",
            "First Class",
            "QmXabc123"
        );

        (string memory status,,,,,) = registry.verifyCertificate(raviHash);
        assertEq(status, "VALID");
    }

    function test_IssueEmitsEvent() public {
        vm.prank(admin);
        //vm.expectEmit(true, false, false, true);
        vm.expectEmit(true, false, false, false);
        emit CertificateIssued(raviHash, "Ravi Kumar", "B.E. Computer Science", block.timestamp);
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. Computer Science", "First Class", "QmXabc123"
        );
    }

    function test_CannotIssueByNonAdmin() public {
        vm.prank(hacker);
        vm.expectRevert("Not authorized");
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );
    }

    function test_CannotIssueDuplicate() public {
        vm.startPrank(admin);
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );
        vm.expectRevert("Certificate already exists");
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );
        vm.stopPrank();
    }

    // ─── Verify Tests ───────────────────────────────────────

    function test_VerifyValidCertificate() public {
        vm.prank(admin);
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );

        (
            string memory status,
            string memory studentName,
            string memory course,
            string memory grade,
            string memory ipfsCID,
        ) = registry.verifyCertificate(raviHash);

        assertEq(status,      "VALID");
        assertEq(studentName, "Ravi Kumar");
        assertEq(course,      "B.E. CS");
        assertEq(grade,       "First Class");
        assertEq(ipfsCID,     "QmXabc123");
    }

    function test_VerifyFakeCertificate() public {
        (string memory status,,,,,) = registry.verifyCertificate(fakeHash);
        assertEq(status, "NOT_FOUND");
    }

    // ─── Revoke Tests ───────────────────────────────────────

    function test_RevokeCertificate() public {
        vm.startPrank(admin);
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );
        registry.revokeCertificate(raviHash);
        vm.stopPrank();

        (string memory status,,,,,) = registry.verifyCertificate(raviHash);
        assertEq(status, "REVOKED");
    }

    function test_RevokeEmitsEvent() public {
        vm.startPrank(admin);
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );
        vm.expectEmit(true, false, false, false);
        emit CertificateRevoked(raviHash, block.timestamp);
        registry.revokeCertificate(raviHash);
        vm.stopPrank();
    }

    function test_CannotRevokeByNonAdmin() public {
        vm.prank(admin);
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );
        vm.prank(hacker);
        vm.expectRevert("Not authorized");
        registry.revokeCertificate(raviHash);
    }

    function test_CannotRevokeNonExistentCert() public {
        vm.prank(admin);
        vm.expectRevert("Certificate not found");
        registry.revokeCertificate(fakeHash);
    }

    function test_CannotRevokeAlreadyRevoked() public {
        vm.startPrank(admin);
        registry.issueCertificate(
            raviHash, "Ravi Kumar", "B.E. CS", "First Class", "QmXabc123"
        );
        registry.revokeCertificate(raviHash);
        vm.expectRevert("Already revoked");
        registry.revokeCertificate(raviHash);
        vm.stopPrank();
    }

    // ─── Admin Transfer ─────────────────────────────────────

    function test_TransferAdmin() public {
        address newAdmin = address(3);
        vm.prank(admin);
        registry.transferAdmin(newAdmin);
        assertEq(registry.admin(), newAdmin);
    }
}
