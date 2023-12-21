import "dotenv/config";

import * as moneroTs from "monero-ts";

import type { MoneroSubaddress, MoneroTxQuery, MoneroTxWallet, MoneroWalletConfig, MoneroWalletRpc } from "monero-ts";
import { includes, isEmpty, snakeCase } from "lodash";

import fs from "fs";
import { v4 } from "uuid";

const walletsDir = process.env.WALLETS_DIR || "./wallets";
const walletRpcURL = process.env.WALLET_RPC_URL || "http://localhost:38084";
const walletRpcUser = process.env.WALLET_RPC_USER || "rpc_user";
const walletRpcPassword = process.env.WALLET_RPC_PASSWORD || "abc123";

const mainWalletPath = process.env.WALLET_PATH || "main";
const mainWalletPassword = process.env.WALLET_PASSWORD || "";

let walletRpc: MoneroWalletRpc;

export const getRandomId = () => {
    return v4();
};

export const getWalletRpc = async () => {
    if (!walletRpc) {
        walletRpc = await moneroTs.connectToWalletRpc(walletRpcURL, walletRpcUser, walletRpcPassword);
    }
    return walletRpc;
}

export const getWallet = async (args: MoneroWalletConfig, createNew = true): Promise<MoneroWalletRpc> => {
    let wallet: MoneroWalletRpc;
    let rpc: MoneroWalletRpc;

    const pwFile = `${walletsDir}/${args.path}.pw`;

    try {
        rpc = await getWalletRpc();

        if (!rpc) {
            throw new Error("no rpc");
        }

        if (!fs.existsSync(pwFile) && !createNew) {
            throw new Error("wallet not found");
        }

        if (isEmpty(args.password)) {
            const pw = fs.readFileSync(pwFile, { encoding: "utf8" });
            args.password = pw;
        }

        const existingWallet = await rpc.openWallet(args.path, args.password);
        if (!existingWallet) {
            throw new Error("existing wallet not found");
        }
        wallet = existingWallet;
    }
    catch (error) {
        const existingError = error.message === "existing wallet not found" || includes(error.message, "Failed to open wallet");
        console.error("error", error.message);

        if (createNew && existingError) {
            if (!fs.existsSync(walletsDir)) {
                throw new Error("walletsDir file not found");
            };

            wallet = await rpc.createWallet(args);

            // TODO use hashed db, and client stored.
            // write pw to file
            const pwFile = `${walletsDir}/${args.path}.pw`;
            fs.writeFileSync(pwFile, args.password, { encoding: "utf8" });

        };
    } finally {
        return wallet;
    }
}


export interface SendTx {
    destination: string;
    amount: bigint;
};

export const sendTx = async (args: MoneroWalletConfig, dest: SendTx): Promise<MoneroTxWallet | null> => {
    const { amount, destination } = dest;
    const wallet = await getWallet(args, false);
    if (!wallet) {
        throw new Error("no wallet");
    }

    // send funds from RPC wallet to WebAssembly wallet
    let createdTx = await wallet.createTx({
        accountIndex: 0,
        address: destination,
        amount, // send 0.25 XMR (denominated in atomic units)
        relay: true // create transaction and relay to the network if true
    });

    return createdTx;
}

export const getTxs = async (args: MoneroWalletConfig, query: MoneroTxQuery): Promise<MoneroTxWallet[]> => {
    try {
        let qry = query;
        const wallet = await getWallet(args, false);
        if (!wallet) {
            throw new Error("no wallet");
        }

        // const walletHeight = await wallet.getHeight();
        // qry.minHeight = walletHeight // minumum height to start search;
        // qry.includeOutputs = true; // include outputs in the tx results
        const txs = await wallet.getTxs(qry);

        return txs;
    }
    catch (error) {
        console.error("error", error);
        return [];
    }
}


export const listenMain = async () => {
    try {
        const mainWallet = await getWallet({ path: mainWalletPath, password: mainWalletPassword } as any, false);
        if (!mainWallet) {
            throw new Error("no main wallet");
        }

        await mainWallet.sync(new class extends moneroTs.MoneroWalletListener {
            async onSyncProgress(height: number, startHeight: number, endHeight: number, percentDone: number, message: string) {
                // feed a progress bar?
                console.log("sync progress", { height, startHeight, endHeight, percentDone, message });
            }
        } as moneroTs.MoneroWalletListener);

        // synchronize in the background every 5 seconds
        await mainWallet.startSyncing(5000);



    }
    catch (error) {
        console.error("error", error);
    }
}

export const createSubAddress = async (args: MoneroWalletConfig, label: string): Promise<MoneroSubaddress> => {
    const mainWallet = await getWallet(args, false);
    if (!mainWallet) {
        throw new Error("no main wallet");
    }
    
    const subaddress = await mainWallet.createSubaddress(0, label);
    return subaddress;
};
// getWallet
// getWalletTx
// spendWallet / send from wallet
// subscribe / listen
// fullfill tx

/**
    MX                         API
    --------------------------->
    Create Wallet            
    <---------------------------
                     use wallet, create subaddresses, etc
    Get Wallet
    <---------------------------
                     use wallet, create subaddresses, etc
    Get Wallet Tx
    <---------------------------
                     use wallet, create subaddresses, etc
    Spend Wallet  
 */