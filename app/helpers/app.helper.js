const ethers = require("ethers");
const walletHelper = require("./wallet.helper");
const { config } = require("./config.helper");

const EXPECTED_PONG_BACK = 30000;
const KEEP_ALIVE_CHECK_INTERVAL = 15000;
let keepAliveInterval;
let pingTimeout;

class AppHelper {
    constructor() {
        this.init();
    }
    init() {
        try {
            if (config.USE_IPC === "true") {
                this.provider = new ethers.providers.IpcProvider(config.IPC);
            } else {
                this.provider = new ethers.providers.WebSocketProvider(config.WS);
                this.provider._websocket.on("open", () => {
                    keepAliveInterval = setInterval(() => {
                      this.provider._websocket.ping();
                      // Use `WebSocket#terminate()`, which immediately destroys the connection,
                      // instead of `WebSocket#close()`, which waits for the close timer.
                      // Delay should be equal to the interval at which your server
                      // sends out pings plus a conservative assumption of the latency.
                      pingTimeout = setTimeout(() => {
                        this.provider._websocket.terminate();
                      }, EXPECTED_PONG_BACK);
                    }, KEEP_ALIVE_CHECK_INTERVAL);
                  });
                  this.provider._websocket.on("close", async (error) => {
                    console.log("WebSocket Closed...");
                    console.log(error);
                    process.exit()
                  });
                  this.provider._websocket.on("error", async (error) => {
                    console.log("Error....");
                    console.log(error);
                    process.exit();
                  });
                  this.provider._websocket.on("pong", () => {
                    clearInterval(pingTimeout);
                  });
            }
            this.wallet = walletHelper.getWallet();
            this.account = this.wallet.connect(this.provider);
            this.tokenABI = new ethers.utils.Interface(require("../abi/token.json"));
            this.routerABI = new ethers.utils.Interface(require("../abi/router.json"));
            this.presaleABI = new ethers.utils.Interface(require("../abi/presale.json"));
            this.targetContract = new ethers.Contract(config.TOKEN_TARGET, this.tokenABI, this.account);
            this.baseContract = new ethers.Contract(config.TOKEN_BASE, this.tokenABI, this.account);
            this.routerContract = new ethers.Contract(config.ROUTER, this.routerABI, this.account);
            this.presaleContract = new ethers.Contract(config.PRESALE_ADDRESS, this.presaleABI, this.account);
        } catch (e) {
            console.error(e);
            process.exit();
        }
    }
    async load() {
        const baseDecimals = await this.baseContract.decimals();
        const baseSymbol = await this.baseContract.symbol();
        const targetDecimals = await this.targetContract.decimals();
        const targetSymbol = await this.targetContract.symbol();
        return {
            presaleContract: this.presaleContract,
            routerContract: this.routerContract,
            baseContract: this.baseContract,
            baseDecimals: baseDecimals,
            baseSymbol: baseSymbol,
            targetContract: this.targetContract,
            targetDecimals: targetDecimals, 
            targetSymbol: targetSymbol,
            tokenABI: this.tokenABI,
            routerABI: this.routerABI,
            provider: this.provider,
            account: this.account
        }
    }
}

module.exports = new AppHelper();
