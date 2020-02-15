// migrating the appropriate contracts
var ERC721TokenHousing = artifacts.require("./ERC721TokenHousing.sol")
var SquareVerifier = artifacts.require("./SquareVerifier.sol");
// var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = function(deployer) {
  deployer.deploy(ERC721TokenHousing);
  deployer.deploy(SquareVerifier);
  // deployer.deploy(SolnSquareVerifier);
};
