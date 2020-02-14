
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('(airline) cannot register an Airline using registerAirline() if the caller is not registered till 4 registered airlines - a', async () => {
    
    // ARRANGE
    let newAirline = accounts[6];
    const funds = web3.toWei("10");
    await config.flightSuretyApp.topupFunds({from: config.firstAirline, value: funds});
    await config.flightSuretyApp.registerAirline(accounts[2], {from: config.firstAirline});
    await config.flightSuretyApp.registerAirline(accounts[3], {from: config.firstAirline});
    await config.flightSuretyApp.registerAirline(accounts[4], {from: config.firstAirline});
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: accounts[2]});
        await config.flightSuretyApp.registerAirline(newAirline, {from: accounts[3]});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not able to register airline if supponsors do not have enough funds.");
  });
 
  it('(airline) cannot register an Airline using registerAirline() if the caller is not registered till 4 registered airlines - b', async () => {
    
    // ARRANGE
    let newAirline = accounts[6];
    const funds = web3.toWei("10");

    // ACT
    await config.flightSuretyApp.topupFunds({from: accounts[2], value: funds});
    await config.flightSuretyApp.topupFunds({from: accounts[3], value: funds});

    await config.flightSuretyApp.registerAirline(newAirline, {from: accounts[2]});
    await config.flightSuretyApp.registerAirline(newAirline, {from: accounts[3]});

    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, true, "Airline should be able to register airline if supponsors have enough funds.");
  });

  it('(flight) Register Flight - a', async () => {
    
    // ARRANGE
    let flightNumber = "UA141";
    let time = Math.floor((Date.now() + 43200)/ 1000);

    // ACT
    try {
        await config.flightSuretyApp.registerFlight(flightNumber, time, {from: accounts[6]});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isFlightRegistered.call(flightNumber, accounts[6]); 

    // ASSERT
    assert.equal(result, false, "Flight should not be able to be registered if airline is not funded.");
  });

  it('(flight) Register Flight - b', async () => {
    
    // ARRANGE
    let flightNumber = "UA142";
    let time = Math.floor((Date.now() + 43200)/ 1000);
    const funds = web3.toWei("10");
    await config.flightSuretyApp.topupFunds({from: config.firstAirline, value: funds});

    // ACT
    await config.flightSuretyApp.registerFlight(flightNumber, time, {from: config.firstAirline});
    let result = await config.flightSuretyData.isFlightRegistered.call(flightNumber, config.firstAirline); 

    // ASSERT
    assert.equal(result, true, "Flight should be able to be registered if airline is funded.");

  });

  it("(passenger) Buy flight insurance", async function() {

    const amount = web3.toWei("1");
    let flightNumber = "UA142";
    let before_p = web3.eth.getBalance(accounts[7]).toNumber();
    let before_c = (await config.flightSuretyData.getAddressBalance({from: config.owner})).toNumber();
    await config.flightSuretyApp.buyInsurance(config.firstAirline, flightNumber, {from: accounts[7], value: amount, gasPrice: 0});
    let after_p = web3.eth.getBalance(accounts[7]).toNumber();
    let after_c = (await config.flightSuretyData.getAddressBalance({from: config.owner})).toNumber();

    let insurance = await config.flightSuretyData.getInsuranceAmount(accounts[7], flightNumber);
    const resultInsurance = web3.toWei(insurance, "wei");
    assert.equal(resultInsurance.toNumber(), amount, "Insurance bought did not work");
    assert.equal(before_p - after_p, amount, "Passenger paid error");
    assert.equal(after_c - before_c, amount, "Contract recieved error");
   });

  it('(passenger) Credit flight insurance', async () => {

    const payoutAmount = web3.toWei("1.5");
    let flightNumber = "UA142";
    await config.flightSuretyApp.creditInsurees(accounts[7], flightNumber, {from: config.firstAirline});

    let insurance = await config.flightSuretyData.getInsurancePayoutAmount(accounts[7], flightNumber);
    const resultInsurance = web3.toWei(insurance, "wei");
    assert.equal(resultInsurance.toNumber(), payoutAmount, "Insurance credit does not work");
  });

  it('(passenger) Withdraw flight insurance', async () => {

    let flightNumber = "UA142";
    let amount = web3.toWei("0.5");

    let before_p = web3.eth.getBalance(accounts[7]).toNumber();
    let before_c = (await config.flightSuretyData.getAddressBalance({from: config.owner})).toNumber();
    await config.flightSuretyApp.payInsurees(flightNumber, amount, {from: accounts[7], gasPrice: 0});
    let after_p = web3.eth.getBalance(accounts[7]).toNumber();
    let after_c = (await config.flightSuretyData.getAddressBalance({from: config.owner})).toNumber();

    assert.equal(before_c - after_c, amount, "Contract did not pay");
    assert.equal(after_p - before_p, amount, "Passenger recieved error");
  });
});
