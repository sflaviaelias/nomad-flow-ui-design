
import React from "react";

interface SmartTripToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

const SmartTripToggle: React.FC<SmartTripToggleProps> = ({ value, onChange, disabled }) => (
  <div className="flex items-center gap-3 py-2">
    <label htmlFor="smart-trip-toggle" className="font-semibold text-[#AD4F36] text-base flex-1">
      Ativar Viagem Inteligente
    </label>
    <button
      id="smart-trip-toggle"
      type="button"
      aria-pressed={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`
        relative w-12 h-7 rounded-full border transition
        ${value ? "bg-[#E76F51] border-[#E76F51]" : "bg-[#dadada] border-[#dadada]"}
        focus:outline-none
      `}
    >
      <span
        className={`
          absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow transition-transform
          ${value ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  </div>
);

export default SmartTripToggle;
