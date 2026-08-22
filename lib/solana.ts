const RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export type IncomingTransfer = {
  signature: string;
  blockTime: number | null;
  sender: string | null;
  solLamports?: number;
  splMint?: string;
  splAmount?: number;
};

type TokenBalance = {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount: { amount: string; decimals: number; uiAmount: number | null };
};

type SigInfo = {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: unknown;
};

type TxResult = {
  result?: {
    slot: number;
    blockTime: number | null;
    transaction: { message: { accountKeys: string[] } };
    meta: {
      preBalances: number[];
      postBalances: number[];
      preTokenBalances?: TokenBalance[];
      postTokenBalances?: TokenBalance[];
    } | null;
  };
};

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  return (await res.json()) as T;
}

function fromLamports(lamports: number) {
  return lamports / 1_000_000_000;
}

function tokenAmount(raw: string, decimals: number) {
  return Number(raw) / Math.pow(10, decimals);
}

export async function getIncomingTransfers(
  wallet: string,
  lastSignature: string | null
): Promise<{ transfers: IncomingTransfer[]; latestSignature: string | null }> {
  const sigRes = await rpc<{ result?: SigInfo[] }>("getSignaturesForAddress", [
    wallet,
    { limit: 20 },
  ]);
  const sigs = (sigRes.result || []).filter((s) => !s.err);

  let newSigs = sigs;
  if (lastSignature) {
    const idx = sigs.findIndex((s) => s.signature === lastSignature);
    if (idx >= 0) newSigs = sigs.slice(0, idx);
  }

  const transfers: IncomingTransfer[] = [];

  for (const s of newSigs) {
    const txRes = await rpc<TxResult>("getTransaction", [
      s.signature,
      { maxSupportedTransactionVersion: 0, commitment: "confirmed" },
    ]);
    const tx = txRes.result;
    if (!tx || !tx.meta) continue;

    const accountKeys = tx.transaction.message.accountKeys;
    const walletIdx = accountKeys.findIndex((a) => a === wallet);
    const sender = accountKeys[0] || null;

    const t: IncomingTransfer = {
      signature: s.signature,
      blockTime: s.blockTime,
      sender,
    };

    // SOL incoming
    if (walletIdx >= 0) {
      const pre = tx.meta.preBalances[walletIdx] ?? 0;
      const post = tx.meta.postBalances[walletIdx] ?? 0;
      const diff = post - pre;
      if (diff > 0) t.solLamports = diff;
    }

    // SPL incoming — find mints owned by `wallet` that increased
    const preMap = new Map<string, { amount: string; decimals: number }>();
    for (const b of tx.meta.preTokenBalances || []) {
      if (b.owner === wallet) {
        preMap.set(b.mint, {
          amount: b.uiTokenAmount.amount,
          decimals: b.uiTokenAmount.decimals,
        });
      }
    }
    for (const b of tx.meta.postTokenBalances || []) {
      if (b.owner === wallet) {
        const prev = preMap.get(b.mint);
        const postAmt = Number(b.uiTokenAmount.amount);
        const preAmt = prev ? Number(prev.amount) : 0;
        if (postAmt > preAmt) {
          t.splMint = b.mint;
          t.splAmount = tokenAmount(
            String(postAmt - preAmt),
            b.uiTokenAmount.decimals
          );
          break;
        }
      }
    }

    if (t.solLamports || t.splMint) transfers.push(t);
  }

  const latestSignature = sigs[0]?.signature || lastSignature;
  return { transfers, latestSignature };
}

export function lamportsToSol(lamports: number) {
  return fromLamports(lamports);
}
