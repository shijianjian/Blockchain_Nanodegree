var ERC721TokenHousing = artifacts.require('ERC721TokenHousing');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    const token_one = 123;
    const token_two = 456;

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await ERC721TokenHousing.new({from: account_one});

            // TODO: mint multiple tokens
            await this.contract.mint(account_one, token_one);
            await this.contract.mint(account_one, token_two);
        })

        it('should return total supply', async function () { 
            assert.equal((await this.contract.totalSupply.call()).toNumber(), 2, "Incorrect total supply");
        })

        it('should get token balance', async function () { 
            assert.equal((await this.contract.balanceOf.call(account_one)).toNumber(), 2, "Incorrect balance for account_one");
            assert.equal((await this.contract.balanceOf.call(account_two)).toNumber(), 0, "Incorrect balance for account_two");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            assert.equal(
                await this.contract.tokenURI.call(token_one),
                `https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/${token_one}`, "");
        })

        it('should transfer token from one owner to another', async function () { 
            assert.equal(await this.contract.ownerOf(token_one), account_one);
            await this.contract.safeTransferFrom(account_one, account_two, token_one, {from: account_one});
            assert.equal(await this.contract.ownerOf(token_one), account_two);
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721TokenHousing.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () { 
            let res;
            try{
                res = await this.contract.mint.call(account_two, token_one, {from: account_two});
            } catch (e) {}
            assert.notEqual(res, true, "Should be failed.");
        })

        it('should return contract owner', async function () {
            assert.equal(await this.contract.getOwner.call(), account_one, "Owner not correct.");
        })

    });
})