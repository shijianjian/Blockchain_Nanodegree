// Make async working
import "regenerator-runtime/runtime";
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_FLIGHT = 20;

const ACCOUNT_OFFSET = 10;
const ORACLES_COUNT = 20;

console.log('Start server');

function initAccounts() {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts(async (error, accounts) => {
      console.log('Total accounts : ' + accounts.length)
      if (accounts.length < ORACLES_COUNT + ACCOUNT_OFFSET) {
        throw "Increase the number of accounts"
      }
      // Register App as authorized caller
      await flightSuretyData.methods
        .authorizeCaller(config.appAddress)
        .send({ from: accounts[0] })
        .then(result => {
          console.log('App registered as authorized caller')
        }).catch(err => reject(err));
      resolve(accounts);
    });
  });
}

function initOracles(accounts) {
  let registeredOracles = [];
  return new Promise(async (resolve, reject) => {
    flightSuretyApp.methods.REGISTRATION_FEE().call({ from: accounts[0] }, async (error, result) => {
      if(error){
        console.log(error);
      } else {
        let fee = result.toString();
        for(var i = STATUS_CODE_ON_TIME; i < STATUS_CODE_LATE_FLIGHT + STATUS_CODE_ON_TIME; i++) {
          let current_account = accounts[i];
          await flightSuretyApp.methods
            .registerOracle()
            .send({ from: current_account, value: fee, gas: 3000000 }, async (error, result2) => {
              if (error) {
                console.log(error);
              } else {
                await flightSuretyApp.methods
                  .getMyIndexes()
                  .call({ from: current_account }, (error, index) => {
                    if(error){
                      console.log(error);
                    }else{
                      let oracle = {
                        indexes: index,
                        account: current_account
                      }
                      registeredOracles.push(oracle);
                      oracle = [];
                    }
                }).catch(e => reject(e)); 
              }
            }).catch(e => reject(e));
        }
      }
      resolve(registeredOracles);
    }).catch(e => reject(e));
  });
}

function simulateOracelResponse(oracles) {
  return new Promise((resolve, reject) => {
    flightSuretyApp.events.OracleRequest({
      fromBlock: 0
    }, async (error, event) => {
      if (error) console.log(error)
      else {
        console.log('Event emmited from smart contract : ' + JSON.stringify(event.event));
        let payload = {
          index: event.returnValues.index,
          airline: event.returnValues.airline,
          flight: event.returnValues.flight,
          timestamp: event.returnValues.timestamp,
          statusCode: STATUS_CODE_ON_TIME
        }
        console.log("Payload : " + JSON.stringify(payload));
        // Select status code based on flight time
        if ((payload.timestamp * 1000) < Date.now()) {
          payload.statusCode = STATUS_CODE_LATE_FLIGHT;
        }
        // Fetching Indexes for Oracle Accounts
        for (let idx = 0; idx < oracles.length; idx++) {
          if (oracles[idx].indexes.includes(payload.index)) {
            console.log("Oracle matches with requested index : " + JSON.stringify(oracles[idx]));
            // Submit Oracle Response
            await flightSuretyApp.methods
              .submitOracleResponse(payload.index, payload.airline, payload.flight, payload.timestamp, payload.statusCode)
              .send({ from: oracles[idx].address, gas: 200000 }, (error, result) => {
                if (error) {
                  console.log('Tx error : ' + error.message);
                } else {
                  console.log("Sended Oracle Response " + JSON.stringify(oracles[idx]) + " Status Code: " + payload.statusCode);
                }
              })
              .catch(e => reject(e));
          }
        }
      }
    });
  });
}

initAccounts()
  .then(accounts => {
    initOracles(accounts)
  }).then(oracles => {
    simulateOracelResponse(oracles)
  }).catch(e => console.log(e));

const app = express();

export default app;