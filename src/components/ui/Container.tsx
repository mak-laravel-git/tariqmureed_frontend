import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Centered 1320px content column used by every page section. */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-site px-4 sm:px-6 xl:px-0", className)}>{children}</div>;
}
