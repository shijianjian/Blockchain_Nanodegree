# StarNotary DAPP

An ERC721 non-fungible token to claim ownerships of any stars in the sky.

    - Token Name: StarNotaryToken
    - Symbol: SNT

## Requirements for current build
- openzeppelin-solidity == 2.1.2
- Truffle == 5.1.3

## Usage
- Development:
    ```
    $ truffle develop
    truffle(develop) > compile
    ```
- Run tests:
    ```
    $ truffle develop
    truffle(develop) > test
    ```
- Deploy on Rinkeby:
    Modify the ```rinkeby project id``` and ```metamask seed``` in ```truffle-config.js```.
    ```
    $ truffle migrate --reset --network rinkeby
    ```
- Start frontend page:
    ```
    $ cd ./app
    $ npm i
    $ npm run dev
    ```