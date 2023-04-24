require("dotenv").config();
const ethers = require("ethers");

module.exports = {
    "config": {
        AMOUNT_OUT_MIN: String(process.env.AMOUNT_OUT_MIN) || "0",
        BUY_DELAY: Number(process.env.BUY_DELAY),
        DEADLINE: Number(process.env.DEADLINE),
        GAS_LIMIT: process.env.GAS_LIMIT,
        GAS_PRICE: process.env.GAS_PRICE,
        IPC: process.env.IPC,
        PRESALE_ADDRESS: ethers.utils.getAddress(process.env.PRESALE_ADDRESS),
        PURCHASE_AMOUNT: ethers.utils.parseUnits(process.env.PURCHASE_AMOUNT, "ether"),
        PRESALE_START_TIME: process.env.PRESALE_START_TIME,
        ROUTER: ethers.utils.getAddress(process.env.ROUTER),
        RECIPIENT: ethers.utils.getAddress(process.env.RECIPIENT),
        RPC: process.env.RPC,
        TOKEN_TARGET: ethers.utils.getAddress(process.env.TOKEN_TARGET),
        TOKEN_BASE: ethers.utils.getAddress(process.env.TOKEN_BASE),
        USE_IPC: process.env.USE_IPC || false,
        WS: process.env.WS,
    }
}

