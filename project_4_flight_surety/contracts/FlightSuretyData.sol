pragma solidity >=0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping(address => bool) private authorizedCallers;
    mapping(address => uint256) private AirlineFunds;
    uint256 constant MAXIMUM_INSURANCE_VALUE = 1 ether;

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Airline {
        bool isRegistered;
        bool isFunded;
    }

    mapping(address => Airline) public RegisteredAirlines;
    address[] public registeredAddresses;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        string flightNum;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    enum InsuranceState {
        Purchased,
        Credit,
        Claimed
    }

    struct Insurance {
        string flightNum;
        address airline;
        uint256 amount;
        uint256 payoutAmount;
        InsuranceState status;
    }

    struct Passenger {
        Insurance[] insurances;
    }
    mapping(address => Passenger) private InsuredPassengers;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event Fund(uint funds);
    event CreditPassenger(address passenger, uint256 payout);
    event PayPassenger(address passenger, uint256 payout);
    event FlightRegistered(bytes32 key, address airline, string flight);
    event InsuranceWithdrawed(address passenger, uint256 payout);
    event AirlineRegistered(address airline, uint256 registered);
    event InsurancePurchased(address from, address to, uint256 amount);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                )
                                public
                                payable
    {
        contractOwner = msg.sender;
        contractOwner.transfer(msg.value);
    }

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

    /**
    *@dev Modifier that check if caller is authorized
    */
    modifier requireAuthorizedCaller()
    {
        require(authorizedCallers[msg.sender], "Caller is not authorized");
        _;
    }

    /**
    * @dev Modifier that check if an airline exists or not
    */
    modifier requireAirlineRegistered(address airline)
    {
        require(RegisteredAirlines[airline].isRegistered == true, "Airline is not registered.");
        _;
    }

    /**
    * @dev Check if a passenger has the ticket for the airline
    */
    modifier requireValidPassenger(address passenger)
    {
        require(true, "Passenger does not on this airline.");
        _;
    }

    /**
    * @dev Modifier that requires the caller is a funded airline
    */
    modifier requireAirlineFunded(address airline)
    {
        require(RegisteredAirlines[airline].isFunded == true, "Airline is not funded.");
        _;
    }

    modifier requireFlightRegistered(address airline, string memory flight)
    {
        bytes32 key = getFlightKey(airline, flight);
        require(flights[key].isRegistered == true, "Flight is not registered.");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return operational;
    }

    function authorizeCaller(address contractAddress) external requireContractOwner
    {
        authorizedCallers[contractAddress] = true;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    function isAirlineFunded(uint256 minFunds, address airline) external view returns (bool)
    {
        return AirlineFunds[airline] >= minFunds;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
                            (
                                bool mode
                            )
                            external
                            requireContractOwner
    {
        operational = mode;
    }

    function getAddressBalance() public view requireIsOperational returns(uint balance)
    {
        return address(contractOwner).balance;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function getNumOfRegisteredAirlines
                                       (
                                       )
                                       public
                                       view
                                       returns (uint256)
    {
        return registeredAddresses.length;
    }

    /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline
                            (
                                address airline
                            )
                            public
                            requireIsOperational
    {
        require(!RegisteredAirlines[airline].isRegistered, "Airline is already registered.");
        RegisteredAirlines[airline] = Airline({isRegistered: true, isFunded: false});
        registeredAddresses.push(airline);
        emit AirlineRegistered(airline, getNumOfRegisteredAirlines());
    }

    /**
    * @dev is airline registered
    */
    function isAirlineRegistered
                                (
                                    address airline
                                )
                                public
                                view
                                requireIsOperational
                                returns(bool)
    {
        return RegisteredAirlines[airline].isRegistered;
    }


   /**
    * @dev Register a future flight for insuring.
    *
    */
    function registerFlight
                                (
                                    string flight,
                                    uint256 timestamp,
                                    address airline
                                )
                                external
                                requireIsOperational
                                requireAirlineRegistered(airline)
    {
        bytes32 key = getFlightKey(airline, flight);
        require(!flights[key].isRegistered, "Flight is registered already.");

        flights[key] = Flight({
            isRegistered: true,
            statusCode: STATUS_CODE_UNKNOWN,
            updatedTimestamp: timestamp,
            flightNum: flight,
            airline: airline
        });
        emit FlightRegistered(key, airline, flight);
    }

    /**
    * @dev is airline registered
    */
    function isFlightRegistered
                                (
                                    string flight,
                                    address airline
                                )
                                public
                                view
                                requireIsOperational
                                returns(bool)
    {
        bytes32 key = getFlightKey(airline, flight);
        return flights[key].isRegistered;
    }
   /**
    * @dev Update flight status
    *
    */
	function processFlightStatus
                                (
                                    address airline,
                                    string  flight,
                                    uint8 statusCode
                                )
                                external
                                requireIsOperational
                                requireFlightRegistered(airline, flight)
    {
		bytes32 key = getFlightKey(airline, flight);
		flights[key].statusCode = statusCode;
	}

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                            (
                                string memory flight,
                                address passenger,
                                address airline
                            )
                            public
                            payable
                            requireIsOperational
                            requireFlightRegistered(airline, flight)
                            requireValidPassenger(passenger)
    {
        require(msg.value <= MAXIMUM_INSURANCE_VALUE, "Invalid insurance amount.");
        Insurance memory ins = Insurance({
            flightNum: flight, airline: airline, amount: msg.value, payoutAmount: 0, status: InsuranceState.Purchased});

        for(uint i; i < InsuredPassengers[passenger].insurances.length; i ++) {
            if (keccak256(abi.encodePacked(InsuredPassengers[passenger].insurances[i].flightNum)) == keccak256(abi.encodePacked(flight))) {
                require(true, "Insurance bought.");
            }
        }
        // Create new
        InsuredPassengers[passenger].insurances.push(ins);
        emit InsurancePurchased(passenger, contractOwner, msg.value);
    }

    /**
     * @dev get insurance details
    */
    function getInsuranceAmount
                                (
                                    address passenger,
                                    string flight
                                )
                                external
                                view
                                requireIsOperational
                                returns(uint256)
    {
        for(uint i = 0; i < InsuredPassengers[passenger].insurances.length; i++){
            if (keccak256(abi.encodePacked(InsuredPassengers[passenger].insurances[i].flightNum)) == keccak256(abi.encodePacked(flight))) {
                return InsuredPassengers[passenger].insurances[i].amount;
            }
        }
    }

    /**
     * @dev get insurance details
    */
    function getInsurancePayoutAmount
                                (
                                    address passenger,
                                    string flight
                                )
                                external
                                view
                                requireIsOperational
                                returns(uint256)
    {
        for(uint i = 0; i < InsuredPassengers[passenger].insurances.length; i++){
            if (keccak256(abi.encodePacked(InsuredPassengers[passenger].insurances[i].flightNum)) == keccak256(abi.encodePacked(flight))) {
                return InsuredPassengers[passenger].insurances[i].payoutAmount;
            }
        }
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    address passenger,
                                    string flight
                                )
                                external
                                requireIsOperational
    {
        for(uint i = 0; i < InsuredPassengers[passenger].insurances.length; i++){
            if (keccak256(abi.encodePacked(InsuredPassengers[passenger].insurances[i].flightNum)) != keccak256(abi.encodePacked(flight))) {
                continue;
            }
            if (InsuredPassengers[passenger].insurances[i].status == InsuranceState.Purchased){
                InsuredPassengers[passenger].insurances[i].status = InsuranceState.Credit;
                InsuredPassengers[passenger].insurances[i].payoutAmount = InsuredPassengers[passenger].insurances[i].amount.mul(15).div(10);
                emit CreditPassenger(passenger, InsuredPassengers[passenger].insurances[i].payoutAmount);
                break;
            }
        }
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address passenger,
                                string flight,
                                uint256 amount
                            )
                            external
                            requireIsOperational
    {
        for(uint i = 0; i < InsuredPassengers[passenger].insurances.length; i++){
            if (keccak256(abi.encodePacked(InsuredPassengers[passenger].insurances[i].flightNum)) != keccak256(abi.encodePacked(flight))) {
                continue;
            }
            if (InsuredPassengers[passenger].insurances[i].status == InsuranceState.Credit){
                InsuredPassengers[passenger].insurances[i].status = InsuranceState.Claimed;
                require(amount <= InsuredPassengers[passenger].insurances[i].payoutAmount, "Not enough allowance.");
                passenger.transfer(amount);
                emit PayPassenger(passenger, InsuredPassengers[passenger].insurances[i].payoutAmount);
                // Reset waiting allowance.
                InsuredPassengers[passenger].insurances[i].payoutAmount -= amount;
                break;
            }
        }
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                                address airline
                            )
                            public
                            payable
                            requireIsOperational
    {
        RegisteredAirlines[airline].isFunded = true;
        // address payable airlinePayable = address(uint160(bytes20(airline)));
        contractOwner.transfer(msg.value);
        AirlineFunds[airline] = msg.value;
        emit Fund(msg.value);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight
                        )
                        internal
                        pure
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund(contractOwner);
    }


}

