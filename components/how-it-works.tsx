"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, DollarSign, ShoppingCart, Camera } from "lucide-react";
import { useProjectName } from "@/components/project-name-provider";
const STEP_DURATION = 5000;

export function HowItWorks() {
  const { projectName, tokenSymbol } = useProjectName();
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const steps = [
    {
      number: "1",
      title: `Buy ${tokenSymbol}`,
      description: `Purchase ${tokenSymbol} on pump.fun. Every swap adds to the creator rewards pool, fueling the next batch.`,
      color: "bg-chart-1",
      icon: Wallet,
    },
    {
      number: "2",
      title: "Rewards Pool",
      description: "All creator rewards from pump.fun are accumulated during each batch period, ready to be converted into meals.",
      color: "bg-chart-4",
      icon: DollarSign,
    },
    {
      number: "3",
      title: "Buy Cat Food",
      description: "100% of the collected rewards are used to purchase cat food from local stores. No hidden fees, no middlemen.",
      color: "bg-chart-2",
      icon: ShoppingCart,
    },
    {
      number: "4",
      title: "Photo Proof",
      description: "Every street cat that gets fed is photographed and shared. Proof of impact, one cat at a time.",
      color: "bg-chart-3",
      icon: Camera,
    },
  ];

  const advanceStep = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, [steps.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(advanceStep, STEP_DURATION);
    return () => clearInterval(interval);
  }, [isPaused, advanceStep]);

  return (
    <section
      id="how-it-works"
      className="w-full bg-gradient-to-b from-secondary-background to-background py-16 sm:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            How {projectName} Works
          </h2>
          <p className="text-base font-base text-foreground/60 max-w-xl mx-auto">
            Every swap fills a bowl for a street cat. Here&apos;s how it becomes a meal.
          </p>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <motion.button
                key={step.title}
                onClick={() => setActiveStep(index)}
                className={`relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-base border-2 transition-all duration-300 focus:outline-none ${
                  isActive
                    ? "bg-white border-foreground"
                    : isCompleted
                    ? "bg-white/40 border-border/40"
                    : "bg-white/80 border-border hover:border-foreground/50"
                }`}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-heading text-base sm:text-lg transition-all duration-300 ${
                    isActive
                      ? `${step.color} border-foreground text-foreground`
                      : isCompleted
                      ? "bg-white border-border/40 text-foreground/40"
                      : "bg-white border-border text-foreground/60"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-xs sm:text-sm font-heading text-center transition-colors duration-300 leading-tight ${
                    isActive ? "text-foreground" : "text-foreground/50"
                  }`}
                >
                  {step.title}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Content card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-base border-2 border-border bg-white p-5 sm:p-6"
          >
            <div className="flex items-start gap-4">
              {(() => {
                const ActiveIcon = steps[activeStep].icon;
                return (
                  <div
                    className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-border flex items-center justify-center ${
                      steps[activeStep].color
                    }`}
                  >
                    <ActiveIcon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-lg sm:text-xl font-heading text-foreground mb-2">
                  {steps[activeStep].title}
                </h3>
                <p className="text-sm sm:text-base font-base text-foreground/70 leading-relaxed">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeStep ? "w-8 bg-foreground" : "w-2 bg-foreground/20"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
