
const { ChainId, Fetcher, Route } = require("@sushiswap/sdk")

async function init() {

    const daiAddressKovan = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa';
    // const daiAddressMain = '0x6b175474e89094c44da98b954eedeac495271d0f';
    const wethAddressKovan = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
    // const wethAddressMain = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const dai = await Fetcher.fetchTokenData(ChainId.KOVAN, daiAddressKovan);
    // const dai = await Fetcher.fetchTokenData(ChainId.MAINNET, daiAddressMain);
    const weth = await Fetcher.fetchTokenData(ChainId.KOVAN, wethAddressKovan);
    // const weth = await Fetcher.fetchTokenData(ChainId.MAINNET, wethAddressMain);
    const pair = await Fetcher.fetchPairData(dai, weth);
    const route = new Route([pair], weth);
    console.log(route.midPrice.toSignificant(6))
    console.log(route.midPrice.invert().toSignificant(6))
}

init()
