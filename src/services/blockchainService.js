const Web3 = require('web3');
const dotenv = require('../config/dotenv');

const web3 = new Web3(new Web3.providers.HttpProvider(dotenv.BLOCKCHAIN_RPC_URL));

exports.storeTransactionHash = async (userId, txHash) => {
    const storedTx = { userId, txHash, timestamp: Date.now() };
};
