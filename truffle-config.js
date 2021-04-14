path = require("path")
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config({path: "./.env"})
console.log(path.join(__dirname, "src/"))
module.exports = {
  contracts_build_directory: path.join(__dirname, "src/contracts"),
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*" // Match any network id
    },
    kovan: {
      provider: ()=> new HDWalletProvider(process.env.MNEMONIC, "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY, 1),
      network_id: 42,
      gas: 5000000,
      gasPrice: 5000000000, // 5 Gwei
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",    // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}