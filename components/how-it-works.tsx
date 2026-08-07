"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectName } from "@/components/project-name-provider";
import { Wallet, ShoppingCart, Camera, ArrowLeftRight, ChevronRight, ChevronLeft, Cat } from "lucide-react";

export function HowItWorks() {
  const { projectName, tokenSymbol } = useProjectName();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      icon: ArrowLeftRight,
      title: `Buy ${tokenSymbol}`,
      description:
        `Purchase ${tokenSymbol} on pump.fun. Every swap adds to the creator rewards pool.`,
      detail:
        `When you buy or sell ${tokenSymbol}, a small creator reward is generated. It doesn't go to offices or investors — it goes straight to our weekly cat food fund.`,
      color: "bg-chart-1",
    },
    {
      id: 2,
      icon: Wallet,
      title: "Creator Rewards",
      description:
        "All creator rewards from pump.fun are accumulated during each weekly batch period.",
      detail:
        "We collect rewards throughout the batch. The wallet is public, so anyone can verify the total amount on-chain at any time.",
      color: "bg-chart-4",
    },
    {
      id: 3,
      icon: ShoppingCart,
      title: "Buy Cat Food",
      description:
        "100% of the collected rewards are used to purchase cat food from local stores.",
      detail:
        "On feeding day, we cash out the rewards and buy as much cat food as possible. Every receipt is photographed and published.",
      color: "bg-chart-2",
    },
    {
      id: 4,
      icon: Camera,
      title: "Photo Proof",
      description:
        "Every street cat that gets fed is photographed. Proof of impact, one cat at a time.",
      detail:
        "We take photos during feeding and upload them to the batch gallery. Every reward becomes a bowl. Every fed cat gets a photo.",
      color: "bg-chart-3",
    },
  ];

  const activeStepData = steps.find((s) => s.id === activeStep) || steps[0];

  const handlePrev = () =>
    setActiveStep((prev) => (prev > 1 ? prev - 1 : steps.length));
  const handleNext = () =>
    setActiveStep((prev) => (prev < steps.length ? prev + 1 : 1));

  return (
    <section
      id="how-it-works"
      className="relative w-full bg-gradient-to-b from-background to-secondary-background py-12 lg:py-16 overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 lg:mb-14">
          <h2 className="text-3xl lg:text-4xl font-heading text-foreground mb-3">
            How {projectName} Works
          </h2>
          <p className="text-base font-base text-foreground/60 max-w-xl mx-auto">
            From every swap to a full bowl. Here&apos;s how creator rewards become cat food, batch by batch.
          </p>
        </div>

        {/* Desktop: Step Cards Grid */}
        <div className="hidden lg:block relative mb-10">
          {/* Animated walking cat trail */}
          <div className="absolute -top-10 left-0 right-0 h-24 pointer-events-none select-none z-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-8"
                style={{
                  left: `${5 + i * 10}%`,
                  top: i % 2 === 0 ? "20%" : "55%",
                  transform: `rotate(${i % 2 === 0 ? 25 : -25}deg)`,
                }}
              >
                <Cat
                  className="w-full h-full text-foreground animate-[stepPrint_3s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.35}s` }}
                />
              </div>
            ))}
          </div>

            <div className="grid grid-cols-4 gap-4 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className="text-left group"
                >
                  <Card
                    className={`border-2 h-full transition-all duration-300 ${
                      isActive
                        ? "bg-main border-border text-main-foreground shadow-[4px_4px_0px_0px_var(--border)]"
                        : "bg-white border-border/50 hover:border-border hover:shadow-[2px_2px_0px_0px_var(--border)]"
                    }`}
                  >
                    <CardContent className="p-5 relative overflow-hidden">
                      {/* Cat watermark */}
                      <Cat
                        className={`absolute -bottom-3 -right-3 w-20 h-20 pointer-events-none select-none ${
                          isActive ? "opacity-[0.12]" : "opacity-[0.08]"
                        } rotate-12 ${isActive ? "text-main-foreground" : "text-foreground"}`}
                      />
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-10 h-10 border-2 border-border rounded-base flex items-center justify-center transition-colors ${
                            isActive ? "bg-white" : step.color
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isActive ? "text-main" : "text-foreground"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-2xl font-heading ${
                            isActive ? "text-main-foreground/40" : "text-foreground/20"
                          }`}
                        >
                          0{step.id}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-heading mb-2 ${
                          isActive ? "text-main-foreground" : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-xs font-base leading-relaxed ${
                          isActive ? "text-main-foreground/80" : "text-foreground/60"
                        }`}
                      >
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Active Detail */}
        <div className="hidden lg:block">
          <Card className="border-2 border-border bg-white" key={activeStep}>
            <CardContent className="p-8 animate-[fadeIn_0.4s_ease-out]">
              <div className="flex items-start gap-6">
                <div
                  className={`w-14 h-14 ${activeStepData.color} border-2 border-border rounded-base flex items-center justify-center flex-shrink-0`}
                >
                  <activeStepData.icon className="w-7 h-7 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl font-heading text-foreground/20">
                      0{activeStepData.id}
                    </span>
                    <h3 className="text-2xl font-heading text-foreground">
                      {activeStepData.title}
                    </h3>
                  </div>
                  <p className="text-base font-base text-foreground/70 leading-relaxed max-w-3xl">
                    {activeStepData.detail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile: Carousel */}
        <div className="lg:hidden relative">
          {/* Animated walking cat trail for mobile */}
          <div className="absolute -top-6 left-0 right-0 h-14 pointer-events-none select-none z-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-6 h-6"
                style={{
                  left: `${8 + i * 16}%`,
                  top: i % 2 === 0 ? "10%" : "50%",
                  transform: `rotate(${i % 2 === 0 ? 20 : -20}deg)`,
                }}
              >
                <Cat
                  className="w-full h-full text-foreground animate-[stepPrint_3s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
              </div>
            ))}
          </div>

          <Card className="border-2 border-border bg-white mb-4 relative overflow-hidden" key={activeStep}>
            {/* Cat watermark */}
            <Cat
              className="absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.08] rotate-12 pointer-events-none select-none text-foreground"
            />
            <CardContent className="p-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 ${activeStepData.color} border-2 border-border rounded-base flex items-center justify-center flex-shrink-0`}
                >
                  <activeStepData.icon className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <span className="text-xl font-heading text-foreground/20">
                    0{activeStepData.id}
                  </span>
                  <h3 className="text-xl font-heading text-foreground">
                    {activeStepData.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm font-base text-foreground/70 leading-relaxed mb-6">
                {activeStepData.detail}
              </p>
              <div className="flex items-center justify-between">
                <Button variant="noShadow" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <div className="flex gap-2">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        activeStep === step.id ? "bg-main" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <Button variant="noShadow" size="sm" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Step Indicators */}
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-3 border-2 rounded-base flex flex-col items-center gap-1.5 transition-all ${
                    isActive
                      ? "border-border bg-white shadow-[2px_2px_0px_0px_var(--border)]"
                      : "border-border/30 bg-white/30"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-foreground" : "text-foreground/40"
                    }`}
                  />
                  <span
                    className={`text-xs font-heading ${
                      isActive ? "text-foreground" : "text-foreground/40"
                    }`}
                  >
                    {step.title.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes stepPrint {
          0%, 100% {
            opacity: 0;
            transform: scale(0.6);
          }
          40%, 60% {
            opacity: 0.5;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}
