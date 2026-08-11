export type DashboardTx = {
  signature: string;
  timestamp: number | null;
  status: "success" | "failed";
  feeSol: number | null;
  type: "sol-transfer" | "token-transfer" | "swap" | "contract" | "unknown";
  from: string | null;
  to: string | null;
  amountSol: number | null;
  tokenAmount: number | null;
  tokenSymbol: string | null;
  programInvolved: string | null;
  readable: string;
  formattedDate: string;
  timeAgo: string;
  solscanUrl: string;
};

export type TokenData = {
  ca: string;
  name: string;
  symbol: string;
  price: string | null;
  marketCap: string | null;
  marketCapRaw: number | null;
  volume: string | null;
  holders: string | null;
  holdersRaw: number | null;
  totalTx: string | null;
  totalTxRaw: number | null;
  buyTx: string | null;
  sellTx: string | null;
  snipers: string | null;
  athMarketCap: string | null;
  athMarketCapRaw: number | null;
  devHolding: string;
  devHoldingRaw: number;
  imageUrl: string | null;
  buyUrl: string;
  solscanUrl: string;
};

export type WalletData = {
  address: string;
  solBalance: number | null;
  solValueUsd: number | null;
  devClaimableSol?: number | null;
  devClaimableUsd?: number | null;
  recentTx: DashboardTx[];
};

export type DashboardData = {
  updatedAt: string;
  solPrice: number | null;
  token: TokenData;
  wallets: {
    foundation: WalletData;
    creator: WalletData;
  };
  tokenRecentTx: DashboardTx[];
};
