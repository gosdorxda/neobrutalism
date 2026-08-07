"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useProjectName } from "@/components/project-name-provider";
import { Wallet, ShoppingCart, Camera, ArrowLeftRight } from "lucide-react";

export function HowItWorks() {
  const { projectName, tokenSymbol } = useProjectName();

  const steps = [
    {
      icon: ArrowLeftRight,
      title: `Buy ${tokenSymbol}`,
      description: `Purchase ${tokenSymbol} on pump.fun. Every swap adds to the creator rewards pool.`,
      color: "bg-chart-1",
    },
    {
      icon: Wallet,
      title: "Creator Rewards",
      description: "All creator rewards from pump.fun are accumulated during each weekly batch period.",
      color: "bg-chart-4",
    },
    {
      icon: ShoppingCart,
      title: "Buy Cat Food",
      description: "100% of the collected rewards are used to purchase cat food from local stores.",
      color: "bg-chart-2",
    },
    {
      icon: Camera,
      title: "Photo Proof",
      description: "Every street cat that gets fed is photographed. Proof of impact, one cat at a time.",
      color: "bg-chart-3",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full bg-gradient-to-b from-secondary-background to-background py-8 sm:py-10"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-heading text-foreground mb-2">
            How {projectName} Works
          </h2>
          <p className="text-sm font-base text-foreground/60 max-w-xl mx-auto">
            From every swap to a full bowl. Here&apos;s how creator rewards become cat food.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.title}
                className="border-2 border-border bg-white h-full"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-9 h-9 ${step.color} border-2 border-border rounded-base flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-heading text-foreground/40">
                          0{index + 1}
                        </span>
                        <h3 className="text-sm font-heading text-foreground leading-tight">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-xs font-base text-foreground/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
