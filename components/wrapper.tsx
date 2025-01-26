import { cn } from "@/lib/utils";
import React from "react";

export default function Wrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | undefined | null | false | 0;
}) {
  return <div className={cn("px-32 py-2", className)}>{children}</div>;
}
