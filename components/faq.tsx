"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProjectName } from "@/components/project-name-provider";

export function FAQ() {
  const { projectName, tokenSymbol } = useProjectName();

  const faqs = [
    {
      question: `What is ${projectName}?`,
      answer:
        `${projectName} is a meme token on pump.fun with one mission: turning creator rewards into meals for street cats. Every trade generates rewards, and 100% of them are used to buy cat food.`,
    },
    {
      question: "How do creator rewards become cat food?",
      answer:
        `Every time ${tokenSymbol} is traded on pump.fun, creator rewards are generated. We collect these rewards throughout each batch. On feeding day, we convert them into funds and buy cat food.`,
    },
    {
      question: "What happens to leftover rewards after a feeding?",
      answer:
        `Any surplus stays in the ${projectName} foundation wallet and funds the next feeding batch. It is never withdrawn as cash. 100% stays for cat food.`,
    },
    {
      question: "How do you ensure transparency?",
      answer:
        "We publish the wallet address so anyone can verify the rewards collected on-chain. We also upload purchase receipts and photos of every feeding session.",
    },
    {
      question: "How often do you feed the cats?",
      answer:
        "On a regular schedule. Each batch runs for a set period, then we withdraw the rewards, buy food, and feed the cats.",
    },
    {
      question: "How many cats have been fed so far?",
      answer:
        "You can check our live stats and batch history. Every completed batch shows exactly how much was collected, how many cats were fed, and how much food was purchased.",
    },
    {
      question: `Who is behind ${projectName}?`,
      answer:
        "We're a small volunteer team of cat lovers using crypto to transparently feed street cats. No team allocation, no hidden fees.",
    },
    {
      question: `How can I support ${projectName}?`,
      answer:
        `The easiest way is to buy ${tokenSymbol}. Every trade contributes to the creator rewards. You can also follow us and help spread the word.`,
    },
    {
      question: `Where can I buy ${tokenSymbol}?`,
      answer:
        `You can buy ${tokenSymbol} directly on pump.fun.`,
    },
  ];

  return (
    <section id="faq" className="w-full bg-gradient-to-b from-background to-secondary-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base font-base text-foreground/60">
            Everything you need to know about {projectName}.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-2 border-border bg-white rounded-base shadow-none"
            >
              <AccordionTrigger className="text-left text-base font-heading text-foreground hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm font-base text-foreground/70 leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
}
