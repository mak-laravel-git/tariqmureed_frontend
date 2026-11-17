import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { AdminIcon } from "./icons";

/** Page title block: back link or breadcrumb, heading, description and primary actions. */
export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: string;
  /** Renders "← label" instead of the plain "Dashboard" breadcrumb. */
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="flex items-center gap-1.5 text-[11px] leading-4 text-muted hover:text-ink">
            <AdminIcon name="arrowLeft" width={12} height={12} />
            {back.label}
          </Link>
        ) : (
          <p className="text-[11px] leading-4 text-muted">Dashboard</p>
        )}
        <h1 className="mt-2 text-2xl leading-8 font-normal tracking-[-0.01em] text-ink sm:text-[26px]">{title}</h1>
        {description && <p className="mt-1 text-xs leading-[18px] text-muted sm:text-[13px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

const button = "inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-[13px] leading-5 font-medium whitespace-nowrap transition-colors disabled:opacity-60";

export function primaryButtonClass(className?: string) {
  return cn(button, "bg-gold text-ink hover:bg-brand", className);
}

export function secondaryButtonClass(className?: string) {
  return cn(button, "border border-line bg-white text-ink hover:border-ink", className);
}

export function PrimaryLink({ children, className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={primaryButtonClass(className)} {...props}>
      {children}
    </Link>
  );
}

export function SecondaryLink({ children, className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={secondaryButtonClass(className)} {...props}>
      {children}
    </Link>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-line bg-white", className)}>{children}</section>;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-[15px] leading-5 font-medium text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs leading-[18px] text-muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}

/** Pill showing a record status (Published, Active, Draft...). */
export function StatusBadge({ status }: { status: string }) {
  const archived = status.toLowerCase() === "archived";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10.5px] leading-4 font-semibold",
        archived ? "bg-chip text-muted" : "bg-[#e6f6ec] text-[#1a7f3d]",
      )}
    >
      {status}
    </span>
  );
}

const fieldBase =
  "w-full rounded-md border border-line bg-white px-3 text-[13px] leading-5 text-ink outline-none placeholder:text-muted focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold/40";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xs leading-4 font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-right text-[11px] leading-4 text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={cn(fieldBase, "h-10", props.className)} />;
}

export function TextArea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(fieldBase, "min-h-[96px] resize-y py-2.5", props.className)} />;
}

export function SelectInput({ children, ...props }: ComponentProps<"select">) {
  return (
    <select {...props} className={cn(fieldBase, "h-10 cursor-pointer", props.className)}>
      {children}
    </select>
  );
}

export function FormMessage({ status, message }: { status: "idle" | "success" | "error"; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={cn("text-xs leading-[18px] font-medium", status === "error" ? "text-live" : "text-[#1a7f3d]")}
    >
      {message}
    </p>
  );
}

export function Flash({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="mb-4 rounded-md border border-[#bfe5cc] bg-[#e6f6ec] px-4 py-2.5 text-xs font-medium text-[#1a7f3d]">
      {children}
    </p>
  );
}
