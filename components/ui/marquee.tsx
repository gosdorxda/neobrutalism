import { ReactNode } from "react";

export default function Marquee({ items }: { items: ReactNode[] }) {
  return (
    <div className="relative flex w-full overflow-x-hidden border-b-2 border-t-2 border-border bg-secondary-background text-foreground font-base">
      <div className="animate-marquee whitespace-nowrap py-8 flex items-center">
        {items.map((item, index) => {
          return (
            <div key={index} className="mx-3 inline-flex shrink-0">
              {item}
            </div>
          )
        })}
      </div>

      <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-8 flex items-center">
        {items.map((item, index) => {
          return (
            <div key={index} className="mx-3 inline-flex shrink-0">
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}
