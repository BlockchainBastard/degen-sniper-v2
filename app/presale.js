const { config } = require("./helpers/config.helper");
const ethers = require("ethers");
const appHelper = require("./helpers/app.helper");

let app;

const formatDateTime = (epochTimeStamp) => {
    const d = new Date(epochTimeStamp * 1000);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = d.getFullYear();
    const month = months[d.getMonth()];
    const date = d.getDate();
    const hour = d.getHours();
    const min = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    const sec = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
    const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

const checkTime = async () => {
    const now = Math.round(Date.now() / 1000);
    if (now >= config.PRESALE_START_TIME) {
        await Contribute();
    }
}

const startConnection = async () => {
    app = await appHelper.load();
    console.log("---------------- Degen Sniper ----------------");
    console.log(`Token Symbol: ${app.targetSymbol}`);
    console.log(`Presale Start Time: ${formatDateTime(config.PRESALE_START_TIME)}`);
    console.log(`Amount to purchase: ${ethers.utils.formatEther(config.PURCHASE_AMOUNT)} BNB`);
    console.log("Waiting for start time...");
    setInterval(checkTime, 1000);
}

const Contribute = async () => {
    const tx = await app.presaleContract.contribute(
        ethers.constants.AddressZero,
        {
          value: config.PURCHASE_AMOUNT,
          gasPrice: config.GAS_PRICE,
        }
    );
    console.log(`🔫  Contribute: ${tx.hash}`);
}

startConnection();
