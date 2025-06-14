
import React from "react";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import destinationsList from "./destinationsList";
import { MapPin } from "lucide-react";

interface DestinationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function DestinationCombobox({
  value,
  onChange,
  disabled,
  autoFocus,
}: DestinationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  // Sincroniza valor externo/IA
  React.useEffect(() => { setInputValue(value); }, [value]);

  // Filtro de sugestões
  const suggestions = inputValue
    ? destinationsList.filter((d) => d.label.toLowerCase().includes(inputValue.toLowerCase()))
    : destinationsList.slice(0, 10); // 10 mais populares

  const handleSelect = (dest: string) => {
    onChange(dest);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full border border-[#DADADA] bg-[#FAF3EC] rounded-md py-2 px-3 flex items-center gap-2 text-base ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          aria-label="Destino"
          onClick={() => setOpen(true)}
        >
          <MapPin className="text-terracotta" size={18} />
          <span className={`truncate flex-1 text-left ${!inputValue ? "text-neutral-400" : ""}`}>
            {inputValue || "Ex: Lisboa, Portugal"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[320px] sm:w-[360px]">
        <Command shouldFilter={false}>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="Digite a cidade ou país"
            autoFocus={autoFocus}
            disabled={disabled}
            className="text-base"
          />
          <CommandList>
            {suggestions.length > 0 ? (
              suggestions.map((d) => (
                <CommandItem
                  key={d.label}
                  onSelect={() => handleSelect(d.value)}
                  className="text-base flex items-center gap-2"
                >
                  <span className="text-xl">{d.flag}</span>
                  <span>{d.label}</span>
                </CommandItem>
              ))
            ) : (
              <CommandEmpty>
                <div className="text-sm py-2 text-center">
                  Nenhum destino encontrado.<br />
                  <button
                    className="underline text-terracotta mt-1"
                    tabIndex={0}
                    onMouseDown={e => { e.preventDefault(); handleSelect(inputValue); }}
                  >
                    <span>Usar &quot;{inputValue}&quot;</span>
                  </button>
                </div>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
