#!/bin/bash
cd /home/zokrates/code/zokrates/code/square
/home/zokrates/zokrates compile -i ./square.code
/home/zokrates/zokrates setup
/home/zokrates/zokrates compute-witness -a 3 9
/home/zokrates/zokrates generate-proof
/home/zokrates/zokrates export-verifier -o /home/zokrates/code/eth-contracts/contracts/SquareVerifier.sol
cp proof.json ../../../eth-contracts/test/