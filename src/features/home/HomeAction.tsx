import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

// Home uses the existing palette; shared form/control tokens remain under issue #21.
export const homeFocus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta-dark";
export function HomeAction({ secondary = false, className, ...props }: LinkProps & { secondary?: boolean }) {
  return <Link {...props} className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors", homeFocus,
    secondary ? "border border-accent/30 bg-white/60 text-accent hover:bg-cream" : "bg-terracotta-dark text-white hover:bg-accent", className)} />;
}
