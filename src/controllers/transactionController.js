exports.verifyTransaction = async (req, res) => {
    try {
        const { txHash } = req.body;
        const receipt = await web3.eth.getTransactionReceipt(txHash);

        if (!receipt) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        return res.status(200).json({ message: "Transaction verified", receipt });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
