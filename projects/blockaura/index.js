const sdk = require('@defillama/sdk');
const {
    transformEthereumAddress
} = require('../helper/portedTokens');
const {
    pool2
} = require('../helper/pool2');
const {
    sumChainTvls
} = require('@defillama/sdk/build/generalUtil');

const TBAC_POOL_STAKING_CONTRACT = '0xf8b7db3268cc0bd9c61fbfbfde963a3727ba154d'
const LP_TOKEN_ETH = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const LP_STAKING_CONTRACT = '0x5dc4ffc0f9c2261dcaae7f69e1a8837afbd577bc'
const BLOCKAURA = '0x591975253e25101f6E6f0383e13E82B7601D8c59'
const ETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const chain = 'ethereum'

async function chainTVL(timestamp, block, chainBlocks) {
    const balances = {}
    const transform = await transformEthereumAddress();

    const USDCPool = await sdk.api.abi.call({
        target: USDC_POOL_STAKING_CONTRACT,
        abi: {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        chain: chain,
        block: chainBlocks[chain]
    })

    sdk.util.sumSingleBalance(balances, transform(USDC), USDCPool.output)
    return balances
};

async function stakingX(timestamp, block, chainBlocks) {
    const balances = {}
    const transform = await transformEthereumAddress();

    const totalTBACLocked = await sdk.api.abi.call({
        target: GOVERNANCE_STAKING_CONTRACT,
        abi: {
            "inputs": [],
            "name": "getTotalLockedTBAC",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        chain: chain,
        block: chainBlocks[chain]
    })

    sdk.util.sumSingleBalance(balances, transform(BLOCKAURA), totalTBACLocked.output)

    return balances
};

async function pool2X(...args) {
    const transform = await transformEthereumAddress();
    return pool2(LP_STAKING_CONTRACT, LP_TOKEN_USDC, chain, transform)(...args)
}

module.exports = {
    timetravel: true,
    start: 1638388550,
    Ethereum: {
        staking: stakingX,
        pool2: pool2X,
        tvl: chainTVL,
    },
    methodology: "We count liquidity that it is in our TBAC-ETH Liquidity Pool, we also count the total locked ETH in our ETH Staking contract and we count the numbers of TBACs staked in our TBAC Staking contract.",
}