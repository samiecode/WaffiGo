// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {WaffiContract} from "../src/WaffiContract.sol";

contract SpendAndSaveTest is Test {
    WaffiContract public spendAndSave;
    address public user = address(1);
    address payable public recipient = payable(address(2));
    address public mockWormholeRelayer = address(3);

    function setUp() public {
        spendAndSave = new WaffiContract(1000); // 10% default
        vm.deal(user, 100 ether);
    }

    function testInitialState() public view {
        assertEq(spendAndSave.defaultSavingsRateBps(), 1000);
    }

    function testSetSavingsRate() public {
        vm.prank(user);
        spendAndSave.setSavingsRate(2000); // 20%

        (,, uint256 rate) = spendAndSave.getUserData(user);
        assertEq(rate, 2000);
    }

    function testTransferDefaultRate() public {
        uint256 recipientBalanceBefore = recipient.balance;
        uint256 amountToSend = 10 ether;

        vm.prank(user);
        spendAndSave.transfer{value: 11 ether}(recipient, amountToSend); // 10 + 10% savings

        (uint256 spent, uint256 saved,) = spendAndSave.getUserData(user);

        assertEq(spent, 10 ether);
        assertEq(saved, 1 ether); // 10% of 10 ether saved
        assertEq(recipient.balance, recipientBalanceBefore + 10 ether); // Full amount sent to recipient
        assertEq(address(spendAndSave).balance, 1 ether); // Only savings remain
    }

    function testTransferCustomRate() public {
        uint256 recipientBalanceBefore = recipient.balance;
        uint256 amountToSend = 10 ether;

        vm.startPrank(user);
        spendAndSave.setSavingsRate(5000); // 50%
        spendAndSave.transfer{value: 15 ether}(recipient, amountToSend); // 10 + 50% savings
        vm.stopPrank();

        (uint256 spent, uint256 saved,) = spendAndSave.getUserData(user);

        assertEq(spent, 10 ether);
        assertEq(saved, 5 ether); // 50% of 10 ether saved
        assertEq(recipient.balance, recipientBalanceBefore + 10 ether); // Full amount sent to recipient
    }

    function testWithdrawSavings() public {
        vm.startPrank(user);
        spendAndSave.transfer{value: 11 ether}(recipient, 10 ether); // Saves 1 ether

        uint256 initialBalance = user.balance;
        spendAndSave.withdrawSavings();

        assertEq(user.balance, initialBalance + 1 ether);

        (, uint256 saved,) = spendAndSave.getUserData(user);
        assertEq(saved, 0);
        vm.stopPrank();
    }

    function testGetUserTransactions() public {
        vm.startPrank(user);
        spendAndSave.transfer{value: 11 ether}(recipient, 10 ether);
        spendAndSave.transfer{value: 5.5 ether}(recipient, 5 ether);
        vm.stopPrank();

        uint256 txCount = spendAndSave.getUserTransactionCount(user);
        assertEq(txCount, 2);
    }

    function testRevertWhenWithdrawNoSavings() public {
        vm.prank(user);
        vm.expectRevert("Nothing to withdraw");
        spendAndSave.withdrawSavings();
    }
}
