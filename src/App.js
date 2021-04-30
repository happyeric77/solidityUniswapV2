import { useEffect, useRef } from "react";
import getWeb3 from "./getWeb3";
const { ChainId, Fetcher, Route, Percent, Trade, TokenAmount, TradeType } = require("@uniswap/sdk");
const daiJson = require("./contracts/Dai.json");
const wethJson = require("./contracts/Weth.json");
const router = require("./contracts/Router.json");


function App() {
  const web3 = useRef();
  const accounts = useRef();
  const contentRef = useRef();
  const daiInstance = useRef();
  const wethInstance = useRef();
  const routerInstance = useRef();
  const accountInfoRef = useRef();
  var daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
  var wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";  

  useEffect(()=>{
    try {
      (async () =>{
        web3.current = await getWeb3();
        // const networkId = await web3.current.eth.net.getId();
        accounts.current = await web3.current.eth.getAccounts();
        daiInstance.current = await new web3.current.eth.Contract(
          daiJson.abi,
          '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
        )
        wethInstance.current = await new web3.current.eth.Contract(
          wethJson.abi,
          "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
        )
        routerInstance.current = await new web3.current.eth.Contract(
          router.abi,
          "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
        )        
        fetchAccountInfo()
      })() 
    } catch (err) {
      console.log(err)
    }
  },[])


  function newElement(content, elem) {
    elem.current.innerHTML = ""
    let newElement = document.createElement("div")
    newElement.innerHTML = content
    elem.current.appendChild(newElement)
  }

  async function fetchAccountInfo() {
    let wethBalance = await wethInstance.current.methods.balanceOf(accounts.current[0]).call()
    let daiBalance = await daiInstance.current.methods.balanceOf(accounts.current[0]).call()
    let allowance = await wethInstance.current.methods.allowance(accounts.current[0], routerInstance.current._address).call()
    newElement(
      `WETH: ${web3.current.utils.fromWei(wethBalance)} <br>
      DAI: ${web3.current.utils.fromWei(daiBalance)} <br>
      Allowance: ${web3.current.utils.fromWei(allowance)}`,
      accountInfoRef
    )
  }

  async function handleFetchPrice(evt) {
    let network;
    switch (evt.target.name) {
        case "kovan":
            network = ChainId.KOVAN;
            daiAddress = "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa"
            wethAddress = "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
            break;
        case "main":
            network = ChainId.MAINNET;
            daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
            wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            break;
        default:
            network = ChainId.KOVAN;
            break;
    }
    
    const dai = await Fetcher.fetchTokenData(network, daiAddress);
    const weth = await Fetcher.fetchTokenData(network, wethAddress);
    const pair = await Fetcher.fetchPairData(dai, weth);
    const route = new Route([pair], weth);
    const trade = new Trade(route, new TokenAmount(weth, web3.current.utils.toWei("1")), TradeType.EXACT_INPUT)

    let midPriceWethDai = await route.midPrice.toSignificant(6)
    let midPriceDaiWeth = await route.midPrice.invert().toSignificant(6)
    let executionPriceWethDai =await trade.executionPrice.toSignificant(6)

    newElement(
      `midPrice (Weth/Dai): ${midPriceWethDai} <br> 
      midPrice (Dai/Weth): ${midPriceDaiWeth} <br> 
      executionPrice (Weth/Dai): ${executionPriceWethDai}`,
      contentRef
    )
  }

  async function handleApprove() {
    wethInstance.current.methods.approve(routerInstance.current._address, web3.current.utils.toWei("0.1")).send({from: accounts.current[0]})
  }

  async function handleSwap() {
    let amountIn = web3.current.utils.toWei("0.1")
    let amountOutRaw = await routerInstance.current.methods.getAmountsOut(amountIn,[wethInstance.current._address, daiInstance.current._address]).call()
    let amountOut = new web3.current.utils.BN(amountOutRaw[1])    
    let amountOutMin = await amountOut.mul(web3.current.utils.toBN(95)).div(web3.current.utils.toBN(100))
    console.log(amountOutMin.toString())
    const amountReceived = await routerInstance.current.methods.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      [wethInstance.current._address, daiInstance.current._address],
      accounts.current[0],
      Math.floor((Date.now()/1000)) + 60*30
    ).send({from:accounts.current[0]})
    console.log(amountReceived)
  }

  async function handleDeposit() {
    await wethInstance.current.methods.deposit().send({from: accounts.current[0], value: web3.current.utils.toWei("0.1")})
  }

  return (
    <div className="App">
      <h1>Balance Info</h1>
      <div ref={accountInfoRef}></div>
      <h1>Check Current Price</h1>
      <button onClick={handleFetchPrice} name="kovan">Fetch price info (Kovan)</button>
      <button onClick={handleFetchPrice} name="main">Fetch price info (MainNet)</button>
      <div ref={contentRef}></div>
      <h1>SWAP WETH to DAI</h1>
      <button onClick={handleApprove}>Approve 0.1 WETH</button>
      <button onClick={handleSwap}>Swap 0.1 WETH to DAI</button>
      <h1>Deposit ETH to WETH</h1>
      <button onClick={handleDeposit}>Deposit 0.1 ETH to WETH</button>
    </div>
  );
}

export default App;
