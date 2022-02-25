// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract IpfsStorage {
  mapping (address => string) public userFiles;

  function setFile(string calldata file) external {
    userFiles[msg.sender] = file;
  }
}
