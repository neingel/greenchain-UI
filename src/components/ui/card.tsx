import * as React from "react";
import { cn } from "./utils";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white shadow rounded-lg", className)}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}