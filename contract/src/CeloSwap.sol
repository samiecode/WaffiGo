// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router {
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}

contract CeloSwap is Ownable, ReentrancyGuard {
    IUniswapV2Router public swapRouter;
    address public wrappedCelo;
    address public cUSD;
    address public cEUR;

    event SwapRouterUpdated(address indexed newRouter);
    event TokenAddressUpdated(string tokenName, address indexed tokenAddress);
    event SwappedCeloToToken(
        address indexed user,
        address indexed tokenOut,
        uint256 celoIn,
        uint256 tokenOutAmount
    );
    event SwappedTokenToCelo(
        address indexed user,
        address indexed tokenIn,
        uint256 tokenInAmount,
        uint256 celoOut
    );

    constructor(
        address _swapRouter,
        address _wrappedCelo,
        address _cUSD
    ) Ownable(msg.sender) {
        require(_swapRouter != address(0), "Invalid router");
        require(_wrappedCelo != address(0), "Invalid WCELO");
        require(_cUSD != address(0), "Invalid cUSD");
        
        swapRouter = IUniswapV2Router(_swapRouter);
        wrappedCelo = _wrappedCelo;
        cUSD = _cUSD;
    }

    function setSwapRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router");
        swapRouter = IUniswapV2Router(_router);
        emit SwapRouterUpdated(_router);
    }

    function setWrappedCelo(address _wrappedCelo) external onlyOwner {
        require(_wrappedCelo != address(0), "Invalid address");
        wrappedCelo = _wrappedCelo;
        emit TokenAddressUpdated("WCELO", _wrappedCelo);
    }

    function setCUSDAddress(address _cUSD) external onlyOwner {
        require(_cUSD != address(0), "Invalid address");
        cUSD = _cUSD;
        emit TokenAddressUpdated("cUSD", _cUSD);
    }

    function setCEURAddress(address _cEUR) external onlyOwner {
        require(_cEUR != address(0), "Invalid address");
        cEUR = _cEUR;
        emit TokenAddressUpdated("cEUR", _cEUR);
    }

    /// @notice Swap CELO to cUSD
    function swapCeloToCUSD(uint256 amountOutMin, uint256 deadline)
        external
        payable
        nonReentrant
        returns (uint256 amountOut)
    {
        require(msg.value > 0, "Must send CELO");
        require(cUSD != address(0), "cUSD not set");

        address[] memory path = new address[](2);
        path[0] = wrappedCelo;
        path[1] = cUSD;

        uint256[] memory amounts = swapRouter.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[amounts.length - 1];
        emit SwappedCeloToToken(msg.sender, cUSD, msg.value, amountOut);
    }

    /// @notice Swap CELO to cEUR
    function swapCeloToCEUR(uint256 amountOutMin, uint256 deadline)
        external
        payable
        nonReentrant
        returns (uint256 amountOut)
    {
        require(msg.value > 0, "Must send CELO");
        require(cEUR != address(0), "cEUR not set");

        address[] memory path = new address[](2);
        path[0] = wrappedCelo;
        path[1] = cEUR;

        uint256[] memory amounts = swapRouter.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[amounts.length - 1];
        emit SwappedCeloToToken(msg.sender, cEUR, msg.value, amountOut);
    }

    /// @notice Swap CELO to any token
    function swapCeloToToken(address tokenOut, uint256 amountOutMin, uint256 deadline)
        external
        payable
        nonReentrant
        returns (uint256 amountOut)
    {
        require(msg.value > 0, "Must send CELO");
        require(tokenOut != address(0), "Invalid token");

        address[] memory path = new address[](2);
        path[0] = wrappedCelo;
        path[1] = tokenOut;

        uint256[] memory amounts = swapRouter.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[amounts.length - 1];
        emit SwappedCeloToToken(msg.sender, tokenOut, msg.value, amountOut);
    }

    /// @notice Swap cUSD to CELO
    function swapCUSDToCelo(uint256 amountIn, uint256 amountOutMin, uint256 deadline)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "Amount must be > 0");
        require(cUSD != address(0), "cUSD not set");

        IERC20(cUSD).transferFrom(msg.sender, address(this), amountIn);
        IERC20(cUSD).approve(address(swapRouter), amountIn);

        address[] memory path = new address[](2);
        path[0] = cUSD;
        path[1] = wrappedCelo;

        uint256[] memory amounts = swapRouter.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[amounts.length - 1];
        emit SwappedTokenToCelo(msg.sender, cUSD, amountIn, amountOut);
    }

    /// @notice Swap any token to CELO
    function swapTokenToCelo(address tokenIn, uint256 amountIn, uint256 amountOutMin, uint256 deadline)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "Amount must be > 0");
        require(tokenIn != address(0), "Invalid token");

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(swapRouter), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = wrappedCelo;

        uint256[] memory amounts = swapRouter.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        amountOut = amounts[amounts.length - 1];
        emit SwappedTokenToCelo(msg.sender, tokenIn, amountIn, amountOut);
    }

    /// @notice Get estimated token output for CELO input
    function getEstimatedTokenForCelo(address tokenOut, uint256 celoAmount)
        external
        view
        returns (uint256)
    {
        address[] memory path = new address[](2);
        path[0] = wrappedCelo;
        path[1] = tokenOut;

        uint256[] memory amounts = swapRouter.getAmountsOut(celoAmount, path);
        return amounts[amounts.length - 1];
    }

    /// @notice Get estimated CELO output for token input
    function getEstimatedCeloForToken(address tokenIn, uint256 tokenAmount)
        external
        view
        returns (uint256)
    {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = wrappedCelo;

        uint256[] memory amounts = swapRouter.getAmountsOut(tokenAmount, path);
        return amounts[amounts.length - 1];
    }

    receive() external payable {}
}