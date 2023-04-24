const { config } = require("./helpers/config.helper");
const ethers = require("ethers");
const appHelper = require("./helpers/app.helper");
const Util = require("util");

let app;

const Wait = async (seconds) => {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
}

const startConnection = async () => {
    app = await appHelper.load();
    console.log("Degen Sniper");
    console.log(`Token to Snipe: ${app.targetSymbol}`);
    console.log(`Amount to purchase: ${ethers.utils.formatUnits(config.PURCHASE_AMOUNT, app.baseDecimals)}`);
    console.log("Now watching txPool for Finalize transaction");
    app.provider.on("pending", (txHash) => {
        app.provider
            .getTransaction(txHash)
            .then(async (tx) => {
                if (tx && tx.to) {
                    const to = ethers.utils.getAddress(tx.to);
                    const re = new RegExp("^(?:0x4bb278f3|0x267dd102)");
                    if (re.test(tx.data)) {
                        if (to === config.PRESALE_ADDRESS) {
                            app.provider.off("pending");
                            if (config.BUY_DELAY > 0) {
                                await Wait(config.BUY_DELAY);
                            }
                            await Snipe(tx.gasPrice);
                            process.exit();
                        }
                    }
                    if (to === config.PRESALE_ADDRESS) {
                        console.log(`Presale transaction: ${tx.hash}`);
                    }
                }
            })
            .catch((e) => {
                console.log(e);
            });
    });
}

const Snipe = async (gasPrice) => {
    const tx = await app.routerContract.swapExactETHForTokens(
        config.AMOUNT_OUT_MIN,
        [config.TOKEN_BASE, config.TOKEN_TARGET],
        config.RECIPIENT,
        Date.now() + 1000 * config.DEADLINE,
        {
          value: config.PURCHASE_AMOUNT,
          gasLimit: config.GAS_LIMIT,
          gasPrice: gasPrice,
        }
    );
    console.log(`Sniped: ${tx.hash}`);
}

startConnection();