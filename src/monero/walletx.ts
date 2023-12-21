// import monero-ts (or import types individually)
import * as moneroTs from "monero-ts";

// create a wallet address
const walletName = "sample_wallet_1x";
const walletPassword = "supersecretpassword123";

// connect to daemon
export const connectX = async () => {

    try {
        // let connectionManager = new moneroTs.MoneroConnectionManager();

        // add managed connections with priorities
        // await connectionManager.addConnection({
        //     priority: 1,
        //     uri: "http://localhost:38081",
        //     username: "rpc_user",
        //     password: "abc123",
        //     rejectUnauthorized: false
        // }); // use localhost as first priority

        // let daemon = await moneroTs.connectToDaemonRpc({
        //     uri: "http://localhost:38081",
        // });

        // const connected = await daemon.isConnected();
        // const syncInfo = await daemon.getSyncInfo();
        // let height = await daemon.getHeight();        // 1523651
        // let txsInPool = await daemon.getTxPool();     // get transactions in the pool
        // console.log("connected daemon", { connected, height, txsInPool });



        let walletRpc = await moneroTs.connectToWalletRpc("http://localhost:38084", "rpc_user", "abc123");

        // const wallet = await walletRpc.createWallet({
        //     path: walletName,
        //     password: walletPassword,
        //     // seed: "hefty value scenic something something another thing then this and that",
        //     // restoreHeight: height,
        // });

        // console.log("wallet", wallet);

        await walletRpc.openWallet(walletName, walletPassword);
        let primaryAddress = await walletRpc.getPrimaryAddress(); // 555zgduFhmKd2o8rPUz...
        let balance = await walletRpc.getBalance();   // 533648366742
        let txs = await walletRpc.getTxs();           // get transactions containing transfers to/from the wallet
        console.log("connected walletRpc", { primaryAddress, balance, txs });
        console.log("walletRpc", walletRpc);

        // const x = await connectionManager.checkConnection();
        // const connected = connectionManager.getConnection();

        // console.log("connected", { connected, x });


        // let walletFull = await moneroTs.createWalletFull({
        //     path: "sample_wallet_full",
        //     password: "supersecretpassword123",
        //     networkType: moneroTs.MoneroNetworkType.STAGENET,
        //     seed: "hefty value scenic something something another thing then this and that",
        //     restoreHeight: height,
        //     // connectionManager,
        //     // server: walletRpc.con
        //     server: { // provide url or MoneroRpcConnection
        //         uri: 'http://localhost:38084',
        //         username: 'rpc_user',
        //         password: 'abc123',
        //         rejectUnauthorized: true,
        //         proxyToWorker: false,
        //     }
        // });

        // console.log("walletFull", walletFull);

        // // // synchronize with progress notifications
        // await walletFull.sync(new class extends moneroTs.MoneroWalletListener {
        //     async onSyncProgress(height: number, startHeight: number, endHeight: number, percentDone: number, message: string) {
        //         // feed a progress bar?
        //         console.log("sync progress", { height, startHeight, endHeight, percentDone, message });
        //     }
        // } as moneroTs.MoneroWalletListener);

        // // synchronize in the background every 5 seconds
        // await walletFull.startSyncing(5000);



    }
    catch (error) {
        console.log("error", error);
    }

}

connectX();