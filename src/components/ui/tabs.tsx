import * as React from "react";
import { cn } from "./utils";

export function Tabs({ children, className = "", defaultValue }: { children: React.ReactNode; className?: string; defaultValue?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

export function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex space-x-2 border-b border-gray-200", className)}>{children}</div>;
}

export function TabsTrigger({ children, value }: { children: React.ReactNode; value: string }) {
  return (
    <button
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600"
      data-value={value}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value }: { children: React.ReactNode; value: string }) {
  return <div className="mt-4" data-value={value}>{children}</div>;
}