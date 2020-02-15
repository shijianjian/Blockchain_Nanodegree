# Udacity Blockchain Capstone

The capstone will build upon the knowledge you have gained in the course in order to build a decentralized housing product. 

## Resources
- Rinkeby:
    - SolnSquareVerifier Address: 0x883b83a382749ff45498f14946B67Bbd020cd3BA
    - Verifier Address: 0x5e69DFaE403C76983BFF56BeCd88743aff7a98b2


## Run
- Deploy on rinkeby:
    Update the mnemonic and projectID in the ```config-truffle.json``` with your mnemonic for testnet.
    ```bash
    $ truffle deploy --network rinkeby
    ```
    If updated:
    ```bash
    $ truffle migrate --network rinkeby --reset --compile-all
    ```
    Dry run can also be skipped by setting ```skipDryRun: true``` in ```config-truffle.json```.


### Appendix: Working with Zokrates
- Start
    ```bash
    $ sh ./start_docker.sh
    ```
    Since the compiling operations will output onto your filesystem. You probably need a sudo in front:
    ```bash
    $ sudo sh ./start_docker.sh
    ```
    Then for an automation:
    ```bash
    $ zokrates-auto-run.sh
    ```
    Then please manually update the progma in side "SquareVerifier" from ```pragma solidity ^0.5.0;``` to ```pragma solidity >=0.5.0;```;
    Or use the following:
- Get into the directory
    ```bash
    $ cd /home/zokrates/code/zokrates/code/square
    ```
- Compile
    ```bash
    $ /home/zokrates/zokrates compile -i ./square.code
    ```
- Generate the Trusted Setup
    ```bash
    $ /home/zokrates/zokrates setup
    ```
- Compute Witness
    To get witness 1:
    ```bash
    $ /home/zokrates/zokrates compute-witness -a 3 9
    ```
    or to get witness 0:
    ```bash
    $ /home/zokrates/zokrates compute-witness -a 4 8
    ```
- Generate proof
    ```bash
    $ /home/zokrates/zokrates generate-proof
    ```
- Export verifier
    ```bash
    $ /home/zokrates/zokrates export-verifier -o /home/zokrates/code/eth-contracts/contracts/SquareVerifier.sol
    ```

### Appendix II: ABI
```json
[{
"type":"function",
"inputs": [
    {"name":"solutionHash", "type":"bytes32", "indexed":true},
    {"name":"to", "type":"address", "indexed":false},
    {"name":"uint256", "type":"tokenId", "indexed":false},
],
"name":"mint"
}]
```

# Project Resources

* [Remix - Solidity IDE](https://remix.ethereum.org/)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Truffle Framework](https://truffleframework.com/)
* [Ganache - One Click Blockchain](https://truffleframework.com/ganache)
* [Open Zeppelin ](https://openzeppelin.org/)
* [Interactive zero knowledge 3-colorability demonstration](http://web.mit.edu/~ezyang/Public/graph/svg.html)
* [Docker](https://docs.docker.com/install/)
* [ZoKrates](https://github.com/Zokrates/ZoKrates)
