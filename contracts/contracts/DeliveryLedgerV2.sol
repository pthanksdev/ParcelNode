// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DeliveryLedgerV1.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title DeliveryLedgerV2
 * @notice Enterprise upgraded version of DeliveryLedger offering pause controls & batch revocation.
 */
contract DeliveryLedgerV2 is DeliveryLedgerV1, PausableUpgradeable {
    mapping(bytes32 => bool) public revokedRoots;
    mapping(bytes32 => string) public revocationReasons;

    event BatchRevoked(bytes32 indexed merkleRoot, string reason);

    /**
     * @notice Version getter
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }

    /**
     * @notice Emergency pause circuit breaker
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause circuit breaker
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Submit a Merkle tree root representing a batch of verified delivery events
     */
    function submitBatch(bytes32 merkleRoot, uint256 eventCount) public override whenNotPaused onlyOwner {
        super.submitBatch(merkleRoot, eventCount);
    }

    /**
     * @notice Revoke a previously committed batch root in case of audit discrepancy
     */
    function revokeBatch(bytes32 merkleRoot, string calldata reason) external onlyOwner whenNotPaused {
        require(submittedRoots[merkleRoot], "Root not submitted");
        require(!revokedRoots[merkleRoot], "Root already revoked");

        revokedRoots[merkleRoot] = true;
        revocationReasons[merkleRoot] = reason;

        emit BatchRevoked(merkleRoot, reason);
    }
}
