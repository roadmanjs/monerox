import { Request, Response, Router } from "express";
import { createSubAddress, getRandomId, getTxs, getWallet, sendTx } from "../monero/wallet";
import { isEmpty, snakeCase } from "lodash"

import { MoneroTxQuery } from "monero-ts";

// createWallet, getAddress, getBalance, getTransaction, sendTransaction

const randomWalletId = () => getRandomId();
const randomWalletPassword = () => getRandomId().replace(/[\W_]/g, "");;
/**
 * POST /wallet
 * Create a wallet
 */
export const createWallet = async (req: Request, res: Response): Promise<void> => {
    const walletId = !isEmpty(req.body?.walletId) ? req.body.walletId : randomWalletId();
    const walletPassword = !isEmpty(req.body?.walletPassword) ? req.body.walletPassword : randomWalletPassword();

    try {
        const wallet = await getWallet({
            path: walletId, password: walletPassword
        } as any, true);

        if (!wallet) {
            throw new Error("failed to create wallet");
        }

        // parse wallet info, amount, etc
        const walletOutput = {
            id: walletId,
            address: await wallet.getPrimaryAddress(),
            height: await wallet.getHeight(),
        };

        res.json({ success: true, data: walletOutput });
    }
    catch (error) {
        console.error("error", error);
        res.json({ success: false, message: error && error.message });
    }
};

/**
 * Get /wallet
 * Get a wallet
 */
export const getWalletById = async (req: Request, res: Response): Promise<void> => {
    const walletId = req.params.walletId;

    try {
        const wallet = await getWallet({
            path: walletId, password: ""
        } as any, false);

        if (!wallet) {
            throw new Error("failed to get wallet");
        };

        // parse wallet info, amount, etc
        const walletOutput = {
            id: walletId,
            address: await wallet.getPrimaryAddress(),
            height: await wallet.getHeight(),
            amount: await wallet.getBalance() + "",
            unlockedAmount: await wallet.getUnlockedBalance() + "",
        };

        res.json({ success: true, data: walletOutput });
    }
    catch (error) {
        console.error("error", error);
        res.json({ success: false, message: error && error.message });
    }
};

/**
 * POST /wallet/[id]/address
 * Generate Address
 */
export const generateAddress = async (req: Request, res: Response): Promise<void> => {
    const walletId = req.params.walletId;
    const addressLabel = req.params.addressLabel; // || randomGenerate();

    try {
        const walletPassword = ""; // x
        const walletAddress = await createSubAddress({
            path: walletId, password: walletPassword
        } as any, addressLabel);

        res.json({ success: true, data: walletAddress.toJson() });
    }
    catch (error) {
        console.error("error", error);
        res.json({ success: false, message: error && error.message });
    }
};

/**
 * POST /wallet/[id]/txs
 * Get Transactions
 */
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    const walletId = req.params.walletId;

    const isIncoming: any = req.body?.isIncoming;
    const isOutgoing: any = req.body?.isOutgoing;
    const isConfirmed: any = req.body?.isConfirmed || true;

    try {
        const walletPassword = ""; // x

        const walletTxs = await getTxs({
            path: walletId, password: walletPassword
        } as any, { isIncoming, isConfirmed, isOutgoing } as MoneroTxQuery);

        res.json({ success: true, data: walletTxs.map(tx => tx.toJson()) });
    }
    catch (error) {
        console.error("error", error);
        res.json({ success: false, message: error && error.message });
    }
};


interface TxDest {
    destination: string;
    amount: string;
    subtractFromAmount: boolean;
}

/**
 * POST /wallet/[id]/send
 * Send Transactions
 */
export const sendTransaction = async (req: Request, res: Response): Promise<void> => {
    const walletId = req.params.walletId;
    const txDest = req.body as TxDest;
    try {
        const walletPassword = ""; // x

        const walletTx = await sendTx({
            path: walletId, password: walletPassword
        } as any, {
            destination: txDest.destination,
            amount: BigInt(txDest.amount),
        });

        res.json({ success: true, data: walletTx.toJson() });
    }
    catch (error) {
        console.error("error", error);
        res.json({ success: false, message: error && error.message });
    }
};


export const walletRouter = () => {
    const route = Router();
    route.post("/", createWallet);
    route.get("/:walletId", getWalletById);
    route.post("/:walletId/address", generateAddress);
    route.post("/:walletId/txs", getTransactions);
    route.post("/:walletId/send", sendTransaction);
    return route;
}
