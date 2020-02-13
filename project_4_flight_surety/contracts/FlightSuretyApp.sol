pragma solidity >=0.4.24;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./FlightSuretyData.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    uint256 public constant LEAST_CONSENSUS_AIRLINE_NUM = 4;
    uint256 public constant MINIMUM_AIRLINE_FUNDING = 10 ether;
    bool operational = true;
    // address[] consensusVotes = new address[](0);
    mapping(address => address[]) consensusVotes;

    address private contractOwner;          // Account used to deploy contract
    FlightSuretyData flightSuretyData;

    /********************************************************************************************/
    /*                                       Events                                             */
    /********************************************************************************************/
    event AirlineRegisterSubmitted(address _airline);
    event AirlineFunded(address _airline);
    event InsureesCredited(string _flightNumber);
    event PassengerInsured();
    event FlightRegistered(string _flight);

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
         // Modify to call data contract's status
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineFunded()
    {
        require(flightSuretyData.isAirlineFunded(10 ether, msg.sender) == true, "Airline is not funded.");
        _;
    }

    modifier requireAirlineRegistered()
    {
        require(flightSuretyData.isAirlineRegistered(msg.sender) == true, "Airline is not registered.");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor
                                (
                                    address firstAirline,
                                    address dataContract
                                )
                                public
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);
        flightSuretyData.registerAirline(firstAirline);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return operational;  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *
    */
    function registerAirline
                            (
                                address airline
                            )
                            external
                            requireIsOperational
                            requireAirlineFunded
    {
        uint256 number = flightSuretyData.getNumOfRegisteredAirlines();
        bool toRegister = true;

        // consensus check
        if (number >= LEAST_CONSENSUS_AIRLINE_NUM) {
            for (uint i = 0; i < consensusVotes[airline].length; i++) {
                if (consensusVotes[airline][i] == msg.sender) {
                    require(true, "Airline has voted already.");
                }
            }

            consensusVotes[airline].push(msg.sender);
            // If half agrees, apart from the orininator
            if (consensusVotes[airline].length >= number.div(2)) {
                toRegister = true;
            } else {
                toRegister = false;
            }
        } else {
            require(flightSuretyData.isAirlineRegistered(msg.sender) == true, "Invalid caller.");
        }
        if (toRegister == true) {
            flightSuretyData.registerAirline(airline);
            emit AirlineRegisterSubmitted(airline);
        }
    }

	/**
	* @dev Submit funds to participate
	*/
	function topupFunds         (
                                )
                                public
                                payable
                                requireIsOperational
                                requireAirlineRegistered
    {
		require(msg.value >= MINIMUM_AIRLINE_FUNDING, "Funds are not enough.");
		flightSuretyData.fund.value(msg.value)(msg.sender);
	}

   /**
    * @dev Register a future flight for insuring.
    *
    */
    function registerFlight
                                (
                                    string flightNumber,
                                    uint256 timestamp
                                )
                                external
                                requireIsOperational
                                requireAirlineFunded
    {
        flightSuretyData.registerFlight(flightNumber, timestamp, msg.sender);
    }

   /**
    * @dev Called after oracle has updated flight status
    *
    */
    function processFlightStatus
                                (
                                    address airline,
                                    string memory flight,
                                    uint8 statusCode
                                )
                                internal
                                requireIsOperational
    {
        flightSuretyData.processFlightStatus(airline, flight, statusCode);
        flightSuretyData.creditInsurees(airline, flight);
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            string flight,
                            uint256 timestamp
                        )
                        external
                        requireIsOperational
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, airline, flight, timestamp);
    }

    function buyInsurance
                            (
                                address airline,
                                string flight
                            )
                            external
                            payable
                            requireIsOperational
    {
        flightSuretyData.buy.value(msg.value)(flight, msg.sender, airline);
    }

    function creditInsurees
                            (
                                address passenger,
                                string flight
                            )
                            external
                            requireIsOperational
    {
        flightSuretyData.creditInsurees(passenger, flight);
    }

    function payInsurees
                            (
                                string flight,
                                uint256 amount
                            )
                            external
                            requireIsOperational
    {
        flightSuretyData.pay.value(amount)(msg.sender, flight);
    }


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status, uint8 index);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 statusCode);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({isRegistered: true,indexes: indexes});
    }

    function getMyIndexes
                            (
                            )
                            external
                            view
                            returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }

    function getRegistrationFee() external pure returns(uint256) {
        return REGISTRATION_FEE;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
    (
        uint8 index,
        address airline,
        string flight,
        uint256 timestamp,
        uint8 statusCode
    )
    external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {
            // Close accepting status to prevent emitting events
            oracleResponses[key].isOpen = false;

            emit FlightStatusInfo(airline, flight, timestamp, statusCode, index);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, statusCode);
        }
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (
                                address account
                            )
                            internal
                            returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
    (
        address account
    )
    internal
    returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}
