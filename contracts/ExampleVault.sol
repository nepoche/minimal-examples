// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

// This contract tracks the state of Values across multiple chains.
// `Value` can be any uint32.
// There is a `ValueIndex` which is a uint32 that tracks the time the `Value` has changed.
// There is a `chainID` which is a unique identifier the other chains that this contract is "linked" to.
contract ExampleVault {
    uint32 public value;
    uint32 public index = 0;

    // Record all the values that have been inserted
	mapping(uint32 => bool) public valueHistory;

	// Map to store chainID => (valueIndex => value) to track neighbor value histories.
	mapping(uint256 => mapping(uint32 => uint32)) public neighborValues;

	// Map to store the current historical value index for a chainID
	mapping(uint256 => uint32) public currentNeighborRootIndex;
	
    struct NeighborData {
		uint256 chainID;
		uint256 index;
		uint32 value;
	}
    NeighborData[] public neighborList;

	// Maps chainID to the index in the neighborList
	mapping(uint256 => uint256) public neighborIndex;
	mapping(uint256 => bool) public neighborExistsForChain;

    event Insertion(uint32 index, uint32 value);
	event NeighborAddition(uint256 chainID, uint256 index, uint32 value);
	event NeighborUpdate(uint256 chainID, uint256 index, uint32 value);

    constructor() {
        value = 0;
    }

    function insert(uint32 _value) public {
        // Uncomment this line to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);
        emit Insertion(index, _value);
        value = _value;
        valueHistory[value] = true;
        index = index + 1;
    }

    function updateNeighbor(uint256 chainID, uint32 neighborValue) public {
        if (!neighborExistsForChain[chainID]) {
            neighborExistsForChain[chainID] = true;
            uint256 updatedIndex = neighborList.length;
            NeighborData memory data = NeighborData({
                chainID: chainID,
                value: neighborValue,
                index: 0
            });
            neighborList.push(data);
            neighborIndex[chainID] = updatedIndex;
            emit NeighborAddition(chainID, 0, value);
        } else {
            uint256 listIndex = neighborIndex[chainID];
            uint256 currentIndex = neighborList[listIndex].index;
            neighborList[listIndex] = NeighborData({
                chainID: chainID,
                value: neighborValue,
                index: currentIndex + 1
            });
            emit NeighborUpdate(chainID, currentIndex + 1, neighborValue);
        }
    }
}
