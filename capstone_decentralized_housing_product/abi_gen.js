var fs = require('fs');

const CONTRACT_ABI = require('./eth-contracts/build/contracts/SolnSquareVerifier');
const NFT_ABI = CONTRACT_ABI.abi;

let json = JSON.stringify(NFT_ABI, undefined, 4);
fs.writeFileSync('./abi.json', json);