"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    const short = `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    return (
      <Button
        variant="neutral"
        size="sm"
        className="w-full"
        onClick={() => disconnect()}
      >
        {short} · Disconnect
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="w-full"
      onClick={() => setVisible(true)}
    >
      <Wallet className="w-4 h-4" /> Connect Wallet
    </Button>
  );
}
