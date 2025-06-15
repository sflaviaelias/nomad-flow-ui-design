
import React from "react";
import { Button } from "@/components/ui/button";

export default function ConciergeQuickSuggestions({
  suggestions,
  onSuggestion,
  disabled,
}: {
  suggestions: string[];
  onSuggestion: (s: string) => void;
  disabled: boolean;
}) {
  const BUTTON_TAG_STYLES =
    "h-11 px-4 rounded-full border border-[#E76F51] bg-[#FAF3EC] text-[#E76F51] font-inter text-sm font-medium hover:bg-[#E76F51] hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E76F51] min-w-[44px] min-h-[44px]";

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map(q => (
        <Button
          key={q}
          variant="outline"
          className={BUTTON_TAG_STYLES}
          onClick={() => onSuggestion(q)}
          disabled={disabled}
          style={{
            minWidth: 44,
            minHeight: 44,
            paddingLeft: 16,
            paddingRight: 16,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500
          }}
          aria-label={q}
        >
          {q}
        </Button>
      ))}
    </div>
  );
}
