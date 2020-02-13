var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "opinion evil gorilla transfer junior output drink unknown hero misery degree stable";

module.exports = {
  networks: {
    // development: {
    //   provider: function() {
    //     return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
    //   },
    //   network_id: '*',
    //   gas: 6712390
    // }
    // This has to be changed for oracle.js to work
    development: {
      host: "127.0.0.1",     // Localhost
      port: 8545,            // Standard Ganache UI port
      network_id: "*", 
      gas: 4600000
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};