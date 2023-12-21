import { Request, Response } from "express";
import { createSubAddress, getTxs, getWallet, sendTx } from "../monero/wallet";

// createWallet, getAddress, getBalance, getTransaction, sendTransaction

/**
 * POST /wallet
 * Create a wallet
 */
export const createWallet = async (req: Request, res: Response): Promise<void> => {
    const walletId = req.body.walletId; // || randomGenerate();
    const walletPassword = req.body.walletPassword; // generatePassword();

    try {
        const wallet = await getWallet({
            path: walletId, password: walletPassword
        } as any, true);

        if (!wallet) {
            throw new Error("failed to create wallet");
        }

        // parse wallet info, amount, etc
        const walletOutput = {

        }

        res.json({ success: true, data: wallet });
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

        }
        res.json({ success: true, data: wallet });
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

        if (!walletAddress) {
            throw new Error("failed to create address");
        }
        res.json({ success: true, data: walletAddress });
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
    // args
    const query = null as any;

    try {
        const walletPassword = ""; // x

        const walletAddress = await getTxs({
            path: walletId, password: walletPassword
        } as any, query);

        res.json({ success: true, data: walletAddress });
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
    const txDest = req.body.to as TxDest;

    try {
        const walletPassword = ""; // x

        const walletTx = await sendTx({
            path: walletId, password: walletPassword
        } as any, {
            destination: txDest.destination,
            amount: BigInt(txDest.amount),
        });

        res.json({ success: true, data: walletTx });
    }
    catch (error) {
        console.error("error", error);
        res.json({ success: false, message: error && error.message });
    }
};
