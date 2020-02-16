const HDWalletProvider = require("truffle-hdwallet-provider")
const web3 = require('web3')
const MNEMONIC = "gym obvious century hungry into cabbage clarify pole carpet coral hope pole"
const INFURA_KEY = "4c06dd6a38334f60baf70ce2cdd6448b"
const NFT_CONTRACT_ADDRESS = "0x883b83a382749ff45498f14946B67Bbd020cd3BA"
const OWNER_ADDRESS = "0x41d2e79D2faB0d2AcdC7902D33c717adEF0712A6"
const NETWORK = "rinkeby"

const CONTRACT_ABI = require('./eth-contracts/build/contracts/SolnSquareVerifier');
const NFT_ABI = CONTRACT_ABI.abi;

var proofs = [];

proofs[0]= {
    "proof": {
        "a": ["0x02d864b3ddd701e78ed23e1dd01352ea76cf81dfac6f183157406f0714146885", "0x1475f822813328f22a2aeadf62bacd87d84d1f32bcd59f14881592d466508ee4"],
        "b": [["0x0f3456d11d10f0ce483c5de2bf7690013604522676dcd99ea53f30a7523c24ea", "0x18929e34011c9711008892799f18f0a8df8d3d4a284489280801b48e35b06ec0"], ["0x2c1f017b517df59aa3d755e75406ae7b360df4d6c214bf01aec2ca14851f4cc7", "0x0a5c28a8eb9bfab945ace666a8611fe23b7b1f7267ed8f2d4911d9368727e9e9"]],
        "c": ["0x2d53e035ccbd72ff27f28bcb2d61f25222ef555ae74eeac5294d1c5c21e2c147", "0x2c37e64539dca2a1a655d149af496b10236cb6651c1b277a36c00dbb3bc1e964"]
    },
    "inputs": ["0x0000000000000000000000000000000000000000000000000000000000000002", "0x0000000000000000000000000000000000000000000000000000000000000000"]
}

proofs[1] = {
    "proof": {
        "a": ["0x028469ec353a5a1f9f25946cccee16dc752865bf8e8eb1aa03874252ad5c2231", "0x0be73b9cbca6572e9839ba1678a33c00f18a3da3870aee111f5a9625ae8a3fc5"],
        "b": [["0x054c4c203b68ce6a3a0335ddda354378c4c980735134879c28aee76db467123c", "0x2d3b66ccbe247e0adf8d8396d0f82f3881ea76c9343342e1be69c2167ce00e98"], ["0x1ecb765b627dedad2196f081b091a2504d3d9c7bc9631684702df827ba231398", "0x037db0ef524a0aed138aece15ae7a07182bd235a8b177ce2a304eb406f9c0b8c"]],
        "c": ["0x0c06dcc745b7e08e302a19beac409ea0a887a78e3635a17f2e44779647f2961e", "0x1227035910283de86a7f092de94639aecddc5aaeb862f1f2ebc474fa7d6622cd"]
    },
    "inputs": ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000000"]
}

proofs[2] = {
    "proof": {
        "a": ["0x0a896eb6ad78faa82355114da3f890225b082ab56ee3f5f3e89b46a5782183bb", "0x0a47e1bec15152f6143eca7e56699d3a4382a9f7a36921bbe49326bef72c007c"],
        "b": [["0x08422711a2c7e75f4e6eccc097cf91e62f1e12058cc590a2a0c618820ea83ad0", "0x1506e1a5b6c9dc3a75ec0086020bbb6e40b1a14eceed9f43de379cab6922c083"], ["0x05013734c56ae7dc9f2e52f141d357ab3acd37d7a0cad825b2b00ec1c4648dcd", "0x101c522b1c1bbff3a90fe4ef855e64e1049bd64d224ccb79205e1bd675352b7b"]],
        "c": ["0x0ccabaa0ce85e6afcf13c6d1d4d6c2fcff2e4d33d787320f776f0bb810db96c0", "0x19ead01d49d03364a4eb4081611187d39522a104b81c61a9bc9fc74354b45a04"]
    },
    "inputs": ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000000"]
}

proofs[3] = {
    "proof": {
        "a": ["0x0d83ee195f53bd146870c8b0b84e38dfd8465180a66534e02fd22c7ffe1b40cd", "0x0a19a35bd1bf398cc51dd59b6cf320e08c166d486ecd52fcf4543b0b6bdb3257"],
        "b": [["0x1ae98178257d19a522ae0f23fee942e0a130e4652b3f92c9ce4659522df3ddb7", "0x210e5b8ea1e08d7dfcc79a6c244fbb0f7b1820e7cadd779d04c99c1780f3ab35"], ["0x0a0973602f3a25ef39b2ac76d46dc32d8240eb68531ea62c8ccceafb3b340e99", "0x0e06b046c9ee8cb9d3536ad4becabc6bc568a6933a57eaff13ff5dab6eb10597"]],
        "c": ["0x2d71c410f129b8eba27559eac3e11a9e656f33c119f8cc584dab18c906125c2e", "0x286cc0762fa242d5bbc7caf7eab4f540dc5037a385c06b078e16b92d4fcf5897"]
    },
    "inputs": ["0x0000000000000000000000000000000000000000000000000000000000000003", "0x0000000000000000000000000000000000000000000000000000000000000000"]
}
 
proofs[4] =  {
    "proof": {
        "a": ["0x2bc5763b4fb7cdb633f6aeaeee58fec4c8c889e80af8e9bcc5f6d8a900de8f3d", "0x006645d53070fc654153812294d5ebaff5fb76899b28e733e3d6db5709953cc7"],
        "b": [["0x1075e35baaac9b92819c26a7ab9d9636ad928acce6c990dc951129f0d993fc2f", "0x000bc3b16c3f5abf7b26a8f05b794aa556c675c2e9ecaa01b04684f8f1da0b16"], ["0x19c701131bfec401db950a0e64535e8edebce16f71c428ed6fe51904adad4539", "0x0f8284324f68c00273789d148b85a52f266cd0ee888b95fae4b3f5ec602bbf83"]],
        "c": ["0x060de7f6c838983978e0a4d4d65805b3060b87ce28f664f4d3e0b34e256a3d52", "0x1262e32d3bab593c443ed03665091c7544f81f84163a062a86a8f12fa97571cb"]
    },
    "inputs": ["0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000000000000000000000"]
}

async function main() {
    const provider = new HDWalletProvider(MNEMONIC, `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`)
    const web3Instance = new web3(provider)

    const nftContract = new web3Instance.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS, { from:OWNER_ADDRESS })

    let i = 3
    let proof = proofs[i];
    let solutionHash = await nftContract.methods.hashingSoution(
            proof.proof.a, proof.proof.b, proof.proof.c, proof.inputs
        ).call({from: OWNER_ADDRESS});
    console.log(`[Minting][${i}] Solution hash:`, solutionHash)
    try {
        await nftContract.methods.addSolution(
            proof.proof.a, proof.proof.b, proof.proof.c, proof.inputs).send({from: OWNER_ADDRESS});
        console.log(`[Minting][${i}]`, "Solution added")
    } catch (e) {
        console.log(`[Minting][${i}]`, "Add solution failed. Probably already existed.")
    }

    try{
        let res = await nftContract.methods.mint(
            solutionHash, OWNER_ADDRESS, i * 1024).send({ from: OWNER_ADDRESS, gas:  5510328});
        console.log(`[Minting][${i}] Minting succeed`); 
        console.log(res)
    } catch(error){
        console.log(`[Minting][${i}] Minting failed`,error);
    }
}

main()