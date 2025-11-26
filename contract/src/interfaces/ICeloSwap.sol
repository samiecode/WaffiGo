// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICeloSwap {
    function swapCeloToCUSD(uint256 amountOutMin, uint256 deadline, address recipient)
        external
        payable
        returns (uint256 amountOut);

    function swapCeloToCEUR(uint256 amountOutMin, uint256 deadline, address recipient)
        external
        payable
        returns (uint256 amountOut);

    function swapCeloToToken(address tokenOut, uint256 amountOutMin, uint256 deadline, address recipient)
        external
        payable
        returns (uint256 amountOut);

    function swapCUSDToCelo(uint256 amountIn, uint256 amountOutMin, uint256 deadline, address recipient)
        external
        returns (uint256 amountOut);

    function swapTokenToCelo(address tokenIn, uint256 amountIn, uint256 amountOutMin, uint256 deadline, address recipient)
        external
        returns (uint256 amountOut);

    function getEstimatedTokenForCelo(address tokenOut, uint256 celoAmount) external view returns (uint256);
    function getEstimatedCeloForToken(address tokenIn, uint256 tokenAmount) external view returns (uint256);
    function cUSD() external view returns (address);
    function cEUR() external view returns (address);
}