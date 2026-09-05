"use client";

export function TokenInput({
  label,
  value,
  onChange,
  symbol,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  symbol: string;
  readOnly?: boolean;
}) {
  return (
    <div className="bg-secondary-background border-2 border-border rounded-base p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-base text-foreground/50 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] font-heading text-foreground/70 px-1.5 py-0.5 bg-background border border-border rounded-base">
          {symbol}
        </span>
      </div>
      {readOnly ? (
        <div className="text-xl font-heading text-foreground truncate min-h-[1.75rem]">
          {value || "0"}
        </div>
      ) : (
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="0.0"
          className="text-xl font-heading text-foreground bg-transparent w-full outline-none min-h-[1.75rem]"
        />
      )}
    </div>
  );
}
