var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "opinion evil gorilla transfer junior output drink unknown hero misery degree stable";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },
      network_id: '*',
      gas: 6712390
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};