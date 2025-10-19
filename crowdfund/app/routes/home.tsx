import { Card } from "../components/card";
import type { Route } from "./+types/home";
import { TextRotate } from "../components/text-rotate";
import { Donut } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useWallet } from "../hooks/use-wallet";
import { useNativeBalance } from "../hooks/use-native-balance";

import { useSubmitTransaction } from "../hooks/use-submit-transaction";
import * as Crowdfund from "../../packages/CDIVEGVPJ2VIZIYUXCA63MEYD6ABWCJTIUXX7NEVGYSYCSMAUPRTBQQG";
import { signTransaction } from "../config/wallet.client";
import { useState, useMemo, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stellar Crowdfunding" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const RPC_URL = "https://soroban-testnet.stellar.org:443";
  const { address, isConnected } = useWallet();
  const { balance, refetch: refetchBalance } = useNativeBalance(address);

  const [amount, setAmount] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);

  const contract = useMemo(() => {
    if (!isConnected || address === "-") return null;

    return new Crowdfund.Client({
      ...Crowdfund.networks.testnet,
      rpcUrl: RPC_URL,
      signTransaction,
      publicKey: address,
    });
  }, [isConnected, address]);

  const { submit, isSubmitting } = useSubmitTransaction({
    rpcUrl: RPC_URL,
    networkPassphrase: Crowdfund.networks.testnet.networkPassphrase,
    onSuccess: handleOnSuccess,
    onError: (error) => {
      console.error("Donation failed", error);
    },
  });

  async function handleOnSuccess() {
    // Fetch updated total
    if (contract) {
      setPreviousTotal(total);
      const totalTx = await contract.get_total_raised();
      const updated = BigInt(totalTx.result as any);
      setTotal(Number(updated));
    }
    await refetchBalance();
    setAmount("");
  }

  async function handleSubmit() {
    if (!isConnected || !contract) return;
    if (!amount.trim()) return;

    try {
      // Convert XLM to stroops (multiply by 10^7)
      const xlmAmount = parseFloat(amount.trim());
      const stroopsAmount = Math.floor(xlmAmount * 10_000_000);

      const tx = await contract.donate({
        donor: address,
        amount: BigInt(stroopsAmount),
      }) as any;

      await submit(tx);
    } catch (e) {
      console.error("Failed to create donation transaction", e);
    }
  }

  useEffect(() => {
    if (!contract) return;

    (async () => {
      try {
        const tx = await contract.get_total_raised();
        const total = Number(BigInt(tx.result));

        setTotal(total);
      } catch (err) {
        setTotal(0);
      }
    })();
  }, [contract]);

  return (
    <div className="flex flex-col items-center gap-y-16">
      <div className="flex flex-row items-center gap-x-6">
        <p className="text-4xl">Learning</p>
        <TextRotate
          texts={["Stellar", "Rust", "Contract", "Frontend"]}
          mainClassName="bg-white text-black rounded-lg text-4xl px-6 py-3"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />
      </div>

      <div className="flex flex-row gap-4">
        <Card className="flex flex-col gap-4 p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Donut className="size-5" />
              <h3 className="text-lg font-medium">Donate</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <img src="/xlm-icon.png" alt="XLM icon" className="size-10 rounded-full" />
            <div>
              <div className="text-sm font-medium">XLM</div>
              <div className="text-xs text-muted-foreground">
                Balance: {isConnected && balance !== "-" ? `${balance} XLM` : "-"}
              </div>
            </div>
          </div>

          <form
            className="flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <Input
              aria-label="Amount in XLM"
              type="text"
              inputMode="decimal"
              placeholder="0.001"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              disabled={isSubmitting}
              className="min-w-[120px]"
            />

            <Button
              className="w-max"
              type="submit"
              onClick={handleSubmit}
              disabled={!isConnected || isSubmitting || !amount.trim()}
            >
              {isSubmitting ? "Donating..." : "Submit"}
            </Button>
          </form>
        </Card>

        <Card className="flex flex-col gap-2 p-8">
          <div className="flex items-center gap-2">
            <Donut className="size-5" />
            <p className="text-lg font-medium">NFT</p>
          </div>
        </Card>

      </div>
      
      <div className="flex flex-col items-center gap-2 pb-8">
        <p>Total Donations</p>
        <p>{(total / 10_000_000).toFixed(2)} XLM</p>
        {previousTotal > 0 && previousTotal !== total && (
          <p className="text-sm text-green-600">
            +{((total - previousTotal) / 10_000_000).toFixed(7)} XLM added
          </p>
        )}
      </div>
    </div>
  );
}