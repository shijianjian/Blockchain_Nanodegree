pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";
import "./Verifier.sol";

contract SquareVerifier is Verifier {

}

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is ERC721TokenHousing {

    // TODO define a solutions struct that can hold an index & an address
    struct Solutions{
        uint[2] a;
        uint[2][2] b;
        uint[2] c;
        uint[2] input;
        address solver;
        bool valid;
        bool used;
    }

    // TODO define an array of the above struct
    SquareVerifier private squareVerifier;
    constructor(address contractVerifierAddress) public {
         squareVerifier = SquareVerifier(contractVerifierAddress);
    }
    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => Solutions) solutions;
    // TODO Create an event to emit when a solution is added
    event SolutionAdded(address solver, uint[2] a, uint[2][2] b, uint[2] c, uint[2] input);

    modifier requireSolutionUnique(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory input) {
        bytes32 sol = hashingSoution(a, b, c, input);
        require(!solutions[sol].valid, "solution is not unique.");
        _;
    }

    modifier requireSolutionUnused(bytes32 solutionHash) {
        require(!solutions[solutionHash].used, "solution has been used.");
        _;
    }

    function hashingSoution(
        uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory input
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b, c, input));
    }

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution(
        uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory input
    ) public requireSolutionUnique(a, b, c, input) {

        bytes32 uniqueSolution = hashingSoution(a, b, c, input);
        require(solutions[uniqueSolution].solver == address(0), "This solution already exist");
        require(squareVerifier.verifyTx(a, b, c,input), "Solution incorrect.");

        // Create a new solution that is not used yet
        solutions[uniqueSolution] = Solutions({
            a: a,
            b: b,
            c: c,
            input: input,
            solver: msg.sender,
            valid: true,
            used: false
        });

        // Emit correponding event
        emit SolutionAdded(msg.sender, a, b, c, input);
    }

    function getSolutionUsed(bytes32 solutionHash) public view returns (bool) {
        return solutions[solutionHash].used;
    }

    function getSolutionValidity(bytes32 solutionHash) public view returns (bool) {
        return solutions[solutionHash].valid;
    }

    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function mint(
        bytes32 solutionHash, address to, uint256 tokenId
    ) public onlyOwner requireSolutionUnused(solutionHash) returns (bool) {
        require(solutions[solutionHash].valid, "This solution does not valid.");
        require(solutions[solutionHash].solver == msg.sender, "Only the address who submitted this solution can use it");

        super.mint(to, tokenId);
        super.setTokenURI(tokenId);
        solutions[solutionHash].used = true;
        return true;
    }
}



