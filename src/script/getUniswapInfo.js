

// import { ChainId, Fetcher, Route } from '@uniswap/sdk'

const { ChainId, Fetcher, Route, Percent, Trade, TokenAmount, TradeType } = require("@uniswap/sdk")


async function fetchAmountOutMin (daiAddress, wethAddress, network) {
    // daiAddressKovan = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
    // daiAddressMain = '0x6b175474e89094c44da98b954eedeac495271d0f'
    // wethAddressKovan = "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
    // wethAddressMain = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

    let net;
    switch (network) {
        case "kovan":
            net = ChainId.KOVAN;
            break;
        case "main":
            net = ChainId.MAINNET;
            break;
        default:
            net = ChainId.KOVAN;
    };
    
    const dai = await Fetcher.fetchTokenData(net, daiAddress);
    const weth = await Fetcher.fetchTokenData(net, wethAddress);
    const pair = await Fetcher.fetchPairData(dai, weth);
    const route = new Route([pair], weth);
    console.log(route.midPrice.toSignificant(6))
    console.log(route.midPrice.invert().toSignificant(6))

    const trade = new Trade(route, new TokenAmount(weth, "1000000000000000000"), TradeType.EXACT_INPUT)
    console.log(trade.executionPrice.toSignificant(6))

    const slippageTollerance = new Percent("10", "10000")
    const amountOutMin = trade.minimumAmountOut(slippageTollerance).raw
    // console.log(amountOutMin)
    return trade.inputAmount.raw, amountOutMin  
}

export {fetchAmountOutMin};
