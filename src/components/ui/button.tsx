import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-gold text-black hover:bg-gold-soft",
  secondary:
    "border border-border text-foreground hover:border-gold hover:text-gold bg-transparent",
  ghost: "text-muted hover:text-foreground",
  danger: "bg-danger text-white hover:opacity-90",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string }) {
  return <Link href={href} className={clsx(base, variants[variant], className)} {...props} />;
}
