// define a variable to import the <Verifier> or <renamedVerifier> solidity contract generated by Zokrates
var Verifier = artifacts.require("Verifier");

// Test verification with correct proof
// - use the contents from proof.json generated from zokrates steps
const PROOF = require('./proof.json');
    
// Test verification with incorrect proof

contract('Verifier', accounts => {

    before(async function () { 
        this.contract = await Verifier.deployed();
    });

    describe('Verification', function () {

        it('Correct proof', async function () { 
            const verified = await this.contract.verifyTx(PROOF.proof.a, PROOF.proof.b, PROOF.proof.c, PROOF.inputs);
            // console.log(verified.logs)
            assert.equal(verified.logs[0].event, 'Verified', "is not verified")
        })
  
        it('Incorrect proof', async function () {
          // mess around the input orders for testing
          const verified = await this.contract.verifyTx(PROOF.proof.c, PROOF.proof.b, PROOF.proof.a, PROOF.inputs);
        //   console.log(verified.logs)
          assert.equal(verified.logs.length, 0, "Should not verify")
      })
  
    });

})
