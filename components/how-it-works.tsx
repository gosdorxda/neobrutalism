"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectName } from "@/components/project-name-provider";
const STEP_DURATION = 4000;

export function HowItWorks() {
  const { projectName, tokenSymbol } = useProjectName();
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const steps = [
    {
      number: "01",
      title: `Buy ${tokenSymbol}`,
      description: `Purchase ${tokenSymbol} on pump.fun. Every swap adds to the creator rewards pool, fueling the next batch.`,
    },
    {
      number: "02",
      title: "Creator Rewards",
      description: "All creator rewards from pump.fun are accumulated during each weekly batch period, ready to be converted into meals.",
    },
    {
      number: "03",
      title: "Buy Cat Food",
      description: "100% of the collected rewards are used to purchase cat food from local stores. No fees, no middlemen.",
    },
    {
      number: "04",
      title: "Photo Proof",
      description: "Every street cat that gets fed is photographed and shared. Proof of impact, one cat at a time.",
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
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-heading text-foreground mb-3"
          >
            How {projectName} Works
          </motion.h2>
          <p className="text-base font-base text-foreground/60 max-w-xl mx-auto">
            From every swap to a full bowl. Here&apos;s how creator rewards become cat food.
          </p>
        </div>

        {/* Horizontal stepper */}
        <div className="relative mb-10 sm:mb-12">
          {/* Track line */}
          <div className="absolute top-[19px] sm:top-[23px] left-0 right-0 h-0.5 bg-border/30" />

          {/* Progress line */}
          <motion.div
            className="absolute top-[19px] sm:top-[23px] left-0 h-0.5 bg-main"
            animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;

              return (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(index)}
                  className="group flex flex-col items-center gap-2 focus:outline-none"
                >
                  <motion.div
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-heading text-sm sm:text-base transition-colors duration-300 ${
                      isActive
                        ? "bg-main border-foreground text-main-foreground"
                        : isCompleted
                        ? "bg-foreground border-foreground text-background"
                        : "bg-white border-border text-foreground"
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {step.number}
                  </motion.div>
                  <span
                    className={`text-xs sm:text-sm font-heading text-center transition-colors duration-300 ${
                      isActive ? "text-foreground" : "text-foreground/40"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="rounded-base border-2 border-border bg-white p-6 sm:p-8"
          >
            <div className="flex items-start gap-4 sm:gap-5">
              <span className="shrink-0 text-3xl sm:text-4xl font-heading text-foreground/20 leading-none">
                {steps[activeStep].number}
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-heading text-foreground mb-2">
                  {steps[activeStep].title}
                </h3>
                <p className="text-base font-base text-foreground/70 leading-relaxed">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
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
