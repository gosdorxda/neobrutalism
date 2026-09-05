import { Buffer } from "buffer";
import {
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  PublicKey,
  AddressLookupTableAccount,
  Connection,
} from "@solana/web3.js";

export async function appendSolFeeInstruction(params: {
  swapTransactionBase64: string;
  userPublicKey: string;
  feeWallet: string;
  feeLamports: number;
  connection: Connection;
}): Promise<VersionedTransaction> {
  const { swapTransactionBase64, userPublicKey, feeWallet, feeLamports, connection } = params;
  const tx = VersionedTransaction.deserialize(Buffer.from(swapTransactionBase64, "base64"));

  const lookups = tx.message.addressTableLookups ?? [];
  const lookupTableAccounts: AddressLookupTableAccount[] = [];
  for (const lookup of lookups) {
    try {
      const res = await connection.getAddressLookupTable(lookup.accountKey);
      if (res.value) lookupTableAccounts.push(res.value);
    } catch {
      // ignore missing LUT
    }
  }

  const decompiled = TransactionMessage.decompile(tx.message);
  if (!decompiled) throw new Error("Failed to decompile swap transaction");

  decompiled.instructions.push(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(userPublicKey),
      toPubkey: new PublicKey(feeWallet),
      lamports: feeLamports,
    })
  );

  const newMessage = decompiled.compileToV0Message(lookupTableAccounts);
  return new VersionedTransaction(newMessage);
}
