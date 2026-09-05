import { JUPITER_QUOTE_API } from "./constants";

export type JupiterQuote = {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct?: string;
  contextSlot?: number;
  [key: string]: unknown;
};

export async function getQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
}): Promise<JupiterQuote | null> {
  const url = `${JUPITER_QUOTE_API}/quote?inputMint=${params.inputMint}&outputMint=${params.outputMint}&amount=${params.amount}&slippageBps=${params.slippageBps}&swapMode=exactIn`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.outAmount) return data as JupiterQuote;
    return null;
  } catch {
    return null;
  }
}

export async function getSwapTransaction(params: {
  quoteResponse: JupiterQuote;
  userPublicKey: string;
}): Promise<string | null> {
  const url = `${JUPITER_QUOTE_API}/swap?quoteResponse=${encodeURIComponent(
    JSON.stringify(params.quoteResponse)
  )}&userPublicKey=${params.userPublicKey}&wrapUnwrapSOL=true`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.swapTransaction ?? null;
  } catch {
    return null;
  }
}
