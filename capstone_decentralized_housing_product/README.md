# Udacity Blockchain Capstone

The capstone will build upon the knowledge you have gained in the course in order to build a decentralized housing product. 


## Run
- Start
    ```bash
    $ sh ./start_docker.sh
    ```
    Since the compiling operations will output onto your filesystem. You probably need a sudo in front:
    ```bash
    $ sudo sh ./start_docker.sh
    ```
    Then
    ```bash
    $ zokrates-auto-run.sh
    ```
    Then please manually update the progma in side "SquareVerifier" from ```pragma solidity ^0.5.0;``` to ```pragma solidity >=0.5.0;```;



### Appendix: Working with Zokrates
- Start
    ```bash
    $ sh ./start_docker.sh
    ```
    Since the compiling operations will output onto your filesystem. You probably need a sudo in front:
    ```bash
    $ sudo sh ./start_docker.sh
    ```
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

# Project Resources

* [Remix - Solidity IDE](https://remix.ethereum.org/)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Truffle Framework](https://truffleframework.com/)
* [Ganache - One Click Blockchain](https://truffleframework.com/ganache)
* [Open Zeppelin ](https://openzeppelin.org/)
* [Interactive zero knowledge 3-colorability demonstration](http://web.mit.edu/~ezyang/Public/graph/svg.html)
* [Docker](https://docs.docker.com/install/)
* [ZoKrates](https://github.com/Zokrates/ZoKrates)
