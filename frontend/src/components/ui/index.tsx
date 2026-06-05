import React, { InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

// --- BUTTON COMPONENT ---
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-98",
          {
            "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:brightness-110":
              variant === "primary",
            "bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white border border-zinc-700":
              variant === "secondary",
            "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white":
              variant === "outline",
            "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-500/10":
              variant === "danger",
            "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200":
              variant === "ghost",
            "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/15":
              variant === "glass",
          },
          {
            "text-xs px-3.5 py-1.5": size === "sm",
            "text-sm px-5 py-2.5": size === "md",
            "text-base px-6 py-3.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// --- INPUT COMPONENT ---
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = "text", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full rounded-xl bg-zinc-900 border border-zinc-800 text-sm px-4 py-3 text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

// --- TEXTAREA COMPONENT ---
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-zinc-900 border border-zinc-800 text-sm px-4 py-3 text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px]",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// --- SELECT COMPONENT ---
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-zinc-900 border border-zinc-800 text-sm px-4 py-3 text-white transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

// --- CARD COMPONENTS ---
export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl text-white shadow-xl shadow-black/10 overflow-hidden",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-xl font-bold tracking-tight text-white", className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-zinc-400", className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-6 pt-0 border-t border-zinc-900/50 mt-4", className)} {...props} />
);

// --- DIALOG MODAL COMPONENT ---
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// --- TABS COMPONENTS ---
interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const Tabs = ({ className, ...props }: TabsProps) => (
  <div className={cn("w-full", className)} {...props} />
);

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList = ({ className, ...props }: TabsListProps) => (
  <div
    className={cn(
      "flex p-1 rounded-xl bg-zinc-900/80 border border-zinc-800/50 mb-6",
      className
    )}
    {...props}
  />
);

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  activeTab: string;
  setActiveTab: (val: string) => void;
}

export const TabsTrigger = ({
  className,
  value,
  activeTab,
  setActiveTab,
  children,
  ...props
}: TabsTriggerProps) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "flex-1 text-center py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none",
        isActive
          ? "bg-zinc-800 text-white shadow-md border border-zinc-700/50"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  activeTab: string;
}

export const TabsContent = ({
  className,
  value,
  activeTab,
  children,
  ...props
}: TabsContentProps) => {
  if (activeTab !== value) return null;
  return (
    <div
      className={cn(
        "w-full animate-in fade-in duration-200 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// --- PROGRESS COMPONENT ---
export const Progress = ({
  value = 0,
  className,
}: {
  value: number;
  className?: string;
}) => {
  return (
    <div className={cn("h-2 w-full bg-zinc-800 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// --- SKELETON LOADER COMPONENT ---
export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-zinc-800/80", className)}
      {...props}
    />
  );
};
