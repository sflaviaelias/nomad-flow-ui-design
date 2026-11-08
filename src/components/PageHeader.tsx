
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  rightAction?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBack = false, backTo, backLabel = "Voltar", rightAction }) => {
  const navigate = useNavigate();
  const { getPrevious } = useNavigationHistory();

  const handleBack = () => {
    // Prefer explicit prop, else go to previous in app stack, else browser default
    if (backTo) {
      navigate(backTo);
    } else {
      const prev = getPrevious();
      if (prev && prev !== window.location.pathname) {
        navigate(prev);
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-4 pt-4 pb-2 bg-[#FAF3EC] shadow-soft rounded-b-lg select-none">
      {showBack ? (
        <button
          type="button"
          className="flex items-center justify-center rounded-full hover:bg-[#E76F5115] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-dark"
          onClick={handleBack}
          aria-label={backLabel}
          style={{
            width: 44, height: 44, minWidth: 44, minHeight: 44
          }}
        >
          <ArrowLeft aria-hidden="true" size={24} className="text-[#E76F51]" />
        </button>
      ) : (
        <div style={{ width: 44, height: 44 }} />
      )}
      <h1 className="flex-1 text-center font-inter font-semibold text-lg md:text-xl"
        style={{ color: "#E76F51", letterSpacing: "-0.01em" }}>
        {title}
      </h1>
      <div style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-end">
        {rightAction ? rightAction : null}
      </div>
    </header>
  );
};

export default PageHeader;
