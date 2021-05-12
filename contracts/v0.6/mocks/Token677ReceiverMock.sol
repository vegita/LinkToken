// SPDX-License-Identifier: MIT
pragma solidity >0.6.0 <0.8.0;

import "../token/IERC677Receiver.sol";

contract Token677ReceiverMock is IERC677Receiver {
  address public tokenSender;
  uint public sentValue;
  bytes public tokenData;
  bool public calledFallback = false;

  function onTokenTransfer(
    address sender,
    uint value,
    bytes memory data
  )
    public
    override
  {
    calledFallback = true;

    tokenSender = sender;
    sentValue = value;
    tokenData = data;
  }
}
