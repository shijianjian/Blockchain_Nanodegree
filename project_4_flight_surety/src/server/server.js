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
      console.log('[PRECONFIG] Total accounts : ' + accounts.length);
      if (accounts.length < ORACLES_COUNT + ACCOUNT_OFFSET) {
        throw "Increase the number of accounts"
      }
      // Register App as authorized caller
      await flightSuretyData.methods
        .authorizeCaller(config.appAddress)
        .send({ from: accounts[0] })
        .then(result => {
          console.log('[PRECONFIG] App registered as authorized caller');
        }).catch(err => reject(err));
      resolve(accounts);
    });
  });
}

function initOracles(accounts) {
  return new Promise(async (resolve, reject) => {
    let registeredOracles = [];
    let fee = await flightSuretyApp.methods.REGISTRATION_FEE().call({from: accounts[0]});
    console.log("[INIT] Registration fee:", fee);
    for(var i = STATUS_CODE_ON_TIME; i < STATUS_CODE_LATE_FLIGHT + STATUS_CODE_ON_TIME; i++) {
      await flightSuretyApp.methods
        .registerOracle()
        .send({ from: accounts[i], value: fee, gas: 3000000 }, async (err, res) => {
          if (err) {
            console.log(`[INIT] Registering ${i}`, accounts[i], err);
          } else {
            console.log(`[INIT] Registering ${i}`, accounts[i]);
            await flightSuretyApp.methods
              .getMyIndexes()
              .call({ from: accounts[i] }, (error, index) => {
                if(error){
                  console.log(`[INIT] Get Indexes ${i}`, accounts[i], err);
                }else{
                  let oracle = {
                    indexes: index,
                    account: accounts[i]
                  }
                  registeredOracles.push(oracle);
                  console.log(`[INIT] Get Indexes ${i}`, accounts[i]);
                }
            }).catch(e => reject(e)); 
          }
        }).catch(e => reject(e));
    }
    resolve(registeredOracles);
  });
}

async function getOracelResponse(oracles, simulate) {
  console.log("[OracleRes] Number of oracles recieved:", oracles.length)
  if (simulate) {
    console.log("[OracleRes] ======================");
    console.log("[OracleRes] Simulating fetching from:", oracles[0].account, "to:", oracles[1].account);
    console.log("[OracleRes] ======================");
    await flightSuretyApp.methods
      .fetchFlightStatus(oracles[0].account, "FAKER", Math.floor((Date.now() + 43200)/ 1000))
      .send({ from: oracles[1].account, gas: 200000 })
      .catch(e => console.log(e));
  }
  return new Promise((resolve, reject) => {
    flightSuretyApp.events.OracleRequest({
      fromBlock: 0
    }, async (error, res) => {
      if (error) {
        console.log("[OracleRes]", error);
        reject(error);
      } else {
        console.log('[OracleRes] Event emmited from smart contract : ' + JSON.stringify(res.event));
        let payload = {
          index: res.returnValues.index,
          airline: res.returnValues.airline,
          flight: res.returnValues.flight,
          timestamp: res.returnValues.timestamp,
          statusCode: STATUS_CODE_ON_TIME
        }
        console.log("[OracleRes] Payload : " + JSON.stringify(payload));
        // Select status code based on flight time
        if ((payload.timestamp * 1000) < Date.now()) {
          payload.statusCode = STATUS_CODE_LATE_FLIGHT;
        }
        // Fetching Indexes for Oracle Accounts
        for (let idx = 0; idx < oracles.length; idx++) {
          if (oracles[idx].indexes.includes(payload.index)) {
            console.log("[OracleRes] Oracle matches with requested index : " + JSON.stringify(oracles[idx]));
            // Submit Oracle Response
            await flightSuretyApp.methods
              .submitOracleResponse(payload.index, payload.airline, payload.flight, payload.timestamp, payload.statusCode)
              .send({ from: oracles[idx].account, gas: 200000 }, (error, result) => {
                if (error) {
                  console.log('[OracleRes] Tx error : ' + error.message);
                } else {
                  console.log("[OracleRes] Sended Oracle Response " + JSON.stringify(oracles[idx]) + " Status Code: " + payload.statusCode);
                }
              })
              .catch(e => reject(e));
          }
        }
      }
    });
    resolve();
  });
}

initAccounts()
  .then(accounts => initOracles(accounts))
  // Leave it to false if not to simulate
  .then(oracles => getOracelResponse(oracles, true))
  .catch(e => console.log(e));

const app = express();

export default app;