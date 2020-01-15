var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "spirit supply whale amount human item harsh scare congress discover talent hamster";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/5736a82f854946b2965976272ee5853c"),
      network_id: 1,
      gas: 4500000,
      // gasPrice: 10000000000
    }
  },
  compilers: { solc: {version: "0.4.24"}}
};