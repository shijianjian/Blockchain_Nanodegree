// migrating the appropriate contracts
var ERC721TokenHousing = artifacts.require("./ERC721TokenHousing.sol")
var Verifier = artifacts.require("./SquareVerifier.sol");
// var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = function(deployer) {
  deployer.deploy(ERC721TokenHousing);
  deployer.deploy(Verifier);
  // deployer.deploy(SolnSquareVerifier);
};
