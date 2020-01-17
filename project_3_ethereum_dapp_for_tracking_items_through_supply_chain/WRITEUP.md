# Blockchain Supply Chain

## Requirements
- truffle
- truffle-hdwallet-provider (for rinkeby deployment)

## UML Diagrams


Activity Diagram
![Activity Diagram](./UML/supply_chain_activity_diagram.jpg)


Sequence Diagram
![Sequence Diagram](./UML/supply_chain_sequence_diagram.jpg)


State Diagram
![State Diagram](./UML/supply_chain_state_diagram.jpg)


Class Diagram
![Class Diagram](./UML/supply_chain_class_diagram.jpg)

## Deployed Address
Transaction ID: 0x64ec7377bf59209fa98316a6cfa65e55abbf445953e96d65e7f54929a363c35f
Rinkeby link: https://rinkeby.etherscan.io/address/0x2d6e3f23841bb0e536317ab58553e5238c7d5f59


## How it works

For development:
1. Launch Ganache
2. Run:
```
$ truffle compile
$ truffle migrate --reset
$ truffle test
```
3. Run local server:
```
npm run dev
```

For Rinkeby:
1. Start up an Infury project and record the Rinkeby network address.
2. Run:
```
$ truffle compile
$ truffle migrate --reset --network rinkeby
$ truffle test
```
3. You will see log like below:
```bash
Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x776f96c8819a61f5e318bcfbfcb657b15db0f8cd5403d5040a73f89f159dd351
  Migrations: 0x4e21f3291484b10bbbfd0bbd8b7b04d679f62a74
Saving successful migration to network...
  ... 0xb93d5273ae5eacf2af194e401a9a976687569ab550802123e262020cbf8012e3
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying FarmerRole...
  ... 0x99eaa952940aff151f9388f361c2465d901f9a63750def85ad9b977c66604705
  FarmerRole: 0x995b7dfb498f2411c9e8c0735f1ef4af7b17c3b6
  Deploying DistributorRole...
  ... 0x643e254303b3991ba2db9f023d69a1498d76b535b2814574d6c34637f5049d84
  DistributorRole: 0x6ccee37c9e7f15975273fb7ff4d296e95593b576
  Deploying RetailerRole...
  ... 0x14dd9117d2307e6b53354d4d013102951fb7854e61aeda52bca556571b9cff70
  RetailerRole: 0xc3d409b40b257f9a8833405d068cb670a661aa6a
  Deploying ConsumerRole...
  ... 0x570f7410d188e5f276c41863794687dac35b7a2545de85fcdc891caa6cf3ce7c
  ConsumerRole: 0xe413e003f0baeb1674440cb792a79b82a8910fa5
  Deploying SupplyChain...
  ... 0x64ec7377bf59209fa98316a6cfa65e55abbf445953e96d65e7f54929a363c35f
  SupplyChain: 0x2d6e3f23841bb0e536317ab58553e5238c7d5f59
Saving successful migration to network...
  ... 0x1859bee5defa4c48aaeeeafe17a59846a33f506895a2f8d759e155aa0f1bf4d9
Saving artifacts...
```

## IPFS
1. Start an IPFS daemon
```
$ ipfs daemon
```
2. Add the project in:
```
$ ipfs add index.html
```
3. By default, check the page on
```https://127.0.0.1:8080/ipfs/${HASH_OF_HTML}```
