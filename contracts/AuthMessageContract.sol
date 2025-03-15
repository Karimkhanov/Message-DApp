// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract AuthMessageContract {
    struct Message {
        string content;
        address sender;
        uint256 timestamp;
    }

    mapping(address => Message[]) private messages;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function storeMessage(string memory _content) public {
        messages[msg.sender].push(
            Message(_content, msg.sender, block.timestamp)
        );
    }

    function getMessages(address user) public view returns (Message[] memory) {
        require(msg.sender == user || msg.sender == owner, "Access denied");
        return messages[user];
    }
}
