
import { useEffect, useRef } from "react";
import getWeb3 from "./getWeb3";
const { ChainId, Fetcher, Route, Percent, Trade, TokenAmount, TradeType } = require("@uniswap/sdk")
const daiJson = require("./contracts/Dai.json")


function App() {
  const web3 = useRef();
  const accounts = useRef();
  const contentRef = useRef();
  var daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
  var wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";  

  useEffect(()=>{
    try {
      (async () =>{
        web3.current = await getWeb3();
        const networkId = await web3.current.eth.net.getId();
        accounts.current = await web3.current.eth.getAccounts();
        // const daiInstance = await new web3.current.eth.Contract(
        //   daiJson.abi,
        //   '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
        // )
        // const bal = await daiInstance.methods.balanceOf(accounts.current[0]).call()
        // console.log(bal)
      })() 
    } catch (err) {
      console.log(err)
    }
  },[])

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

    contentRef.current.innerHTML = ""
    let newElement = document.createElement("div")
    newElement.innerHTML = `
      midPrice (Weth/Dai): ${midPriceWethDai} <br> 
      midPrice (Dai/Weth): ${midPriceDaiWeth} <br> 
      executionPrice (Weth/Dai): ${executionPriceWethDai}`
    contentRef.current.appendChild(newElement)
  }

  return (
    <div className="App">
      <button onClick={handleFetchPrice} name="kovan">Fetch price info (Kovan)</button>
      <button onClick={handleFetchPrice} name="main">Fetch price info (MainNet)</button>
      <div ref={contentRef}></div>
    </div>
  );
}

export default App;
