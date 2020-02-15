// Test if a new solution can be added for contract - SolnSquareVerifier
var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");
var SquareVerifier = artifacts.require('SquareVerifier');
const PROOF = require('./proof.json');

// Test if an ERC721 token can be minted for contract - SolnSquareVerifier
contract('SolnSquareVerifier', accounts => {

    let tokenId = 123;
    let acc = accounts[0];
    let hashing;

    before(async function () {
        let _squareVerifier = await SquareVerifier.new();
        this.contract = await SolnSquareVerifier.new(_squareVerifier.address, { from: accounts[0] });
        hashing = await this.contract.hashingSoution(PROOF.proof.a, PROOF.proof.b, PROOF.proof.c, PROOF.inputs);
    });

    describe('if an ERC721 token can be minted for contract', function () {

        it('can add solution', async function () {
            await this.contract.addSolution(PROOF.proof.a, PROOF.proof.b, PROOF.proof.c, PROOF.inputs);
            assert.equal(await this.contract.getSolutionValidity.call(hashing), true, "Did not add.")
        })

        it('can not add existed solution', async function () {
            let err;
            try {
                await this.contract.addSolution(PROOF.proof.a, PROOF.proof.b, PROOF.proof.c, PROOF.inputs);
            } catch (e) {
                err = e.reason
            }
            assert.equal(err, "solution is not unique.", "Should not be able to mint by the same solution");
        })

        it('can mint', async function () {
            await this.contract.mint(hashing, acc, tokenId);
            assert.equal(
                await this.contract.tokenURI.call(tokenId),
                `https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/${tokenId}`, "Incorrect URI.");
        })

        it('cannot mint by the same solution', async function () {
            let err;
            try {
                await this.contract.mint(hashing, accounts[1], tokenId);
            } catch (e) {
                err = e.reason
            }
            assert.equal(err, "solution has been used.", "Should not be able to mint by the same solution");
        })
  
  
    });

})
