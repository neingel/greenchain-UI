import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn("block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm", className)}
      {...props}
    />
  );
});
Input.displayName = "Input";