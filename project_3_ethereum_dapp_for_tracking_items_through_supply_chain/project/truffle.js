var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "opinion evil gorilla transfer junior output drink unknown hero misery degree stable";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/5736a82f854946b2965976272ee5853c"),
      network_id: 4,
      gas:  5000000,
      gasPrice: 10000000000,
      confirmations: 2,
    }
  },
  compilers: { solc: {version: "0.4.24"}}
};