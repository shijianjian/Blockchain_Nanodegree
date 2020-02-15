// migrating the appropriate contracts
var Verifier = artifacts.require("Verifier");
var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");

module.exports = function(deployer) {
  deployer.deploy(Verifier)
    .then(() => {
        return deployer.deploy(SolnSquareVerifier, Verifier.address);
    });
};
