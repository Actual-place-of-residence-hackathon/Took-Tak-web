interface TabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ options, value, onChange, className = "" }: TabsProps<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 active:scale-95 ${
              active ? "bg-primary-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
