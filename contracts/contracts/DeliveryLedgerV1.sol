// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title DeliveryLedgerV1
 * @dev UUPS Upgradeable Audit Ledger for ParcelNode multi-carrier delivery attestations.
 * Stores batched Merkle roots of confirmed delivery events and enables client-side verification.
 */
contract DeliveryLedgerV1 is OwnableUpgradeable, UUPSUpgradeable {
    /// @notice Event emitted whenever a new Merkle batch root is committed on-chain
    event BatchSubmitted(bytes32 indexed merkleRoot, uint256 timestamp, uint256 eventCount);

    /// @notice Mapping tracking whether a specific Merkle root has been published
    mapping(bytes32 => bool) public submittedRoots;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializer function replacing contract constructor for UUPS proxy
     * @param initialOwner Address of the contract administrator / oracle authority
     */
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    /**
     * @notice Submits a new Merkle root representing a batch of verified tracking events
     * @param merkleRoot The 32-byte cryptographic root of the batch Merkle tree
     * @param eventCount Number of delivery tracking events in the batch
     */
    function submitBatch(bytes32 merkleRoot, uint256 eventCount) public virtual onlyOwner {
        require(merkleRoot != bytes32(0), "Invalid Merkle root");
        require(!submittedRoots[merkleRoot], "Root already submitted");
        require(eventCount > 0, "Event count must be greater than zero");

        submittedRoots[merkleRoot] = true;

        emit BatchSubmitted(merkleRoot, block.timestamp, eventCount);
    }

    /**
     * @notice Verifies a cryptographic Merkle proof against a published batch root
     * @param root The recorded on-chain Merkle root
     * @param leaf The leaf hash derived from the delivery tracking event
     * @param proof Array of sibling hashes forming the Merkle proof path
     * @return True if the leaf hash is member of the Merkle tree root, false otherwise
     */
    function verifyLeaf(
        bytes32 root,
        bytes32 leaf,
        bytes32[] calldata proof
    ) external view returns (bool) {
        require(submittedRoots[root], "Unknown or unsubmitted Merkle root");

        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }

    /**
     * @notice Internal authorization check required for UUPS upgrade pattern
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
