import { cn } from "@/lib/utils";
import React, { createContext, useContext, useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

// Context for managing panel state
interface SidePanelContextType {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

const SidePanelContext = createContext<SidePanelContextType | undefined>(
  undefined,
);

const useSidePanel = () => {
  const context = useContext(SidePanelContext);
  if (!context) {
    throw new Error("useSidePanel must be used within a SidePanel");
  }
  return context;
};

// Main SidePanel Component
interface SidePanelProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SidePanel({
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
}: SidePanelProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const openPanel = () => {
    if (onOpenChange) {
      onOpenChange(true);
    } else {
      setInternalIsOpen(true);
    }
  };

  const closePanel = () => {
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <SidePanelContext.Provider value={{ isOpen, openPanel, closePanel }}>
      <div className="relative">
        {/* Side Panel Overlay for Mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closePanel}
          />
        )}

        {/* Side Panel */}
        <div
          className={cn(
            "fixed right-0 top-0 z-50 h-full w-full transform border-l border-border bg-background shadow-xl transition-transform duration-300 sm:w-[500px] lg:w-[600px]",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">{children}</div>
        </div>
      </div>
    </SidePanelContext.Provider>
  );
}

// Trigger Component (optional - for opening the panel)
interface PanelTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function PanelTrigger({ children, asChild }: PanelTriggerProps) {
  const { openPanel } = useSidePanel();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: openPanel,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  return <div onClick={openPanel}>{children}</div>;
}

// Header Component
interface PanelHeaderProps {
  children: React.ReactNode;
  showClose?: boolean;
}

export function PanelHeader({ children, showClose = true }: PanelHeaderProps) {
  const { closePanel } = useSidePanel();

  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex-1">{children}</div>
      {showClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={closePanel}
          className="h-8 w-8 ml-4"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </Button>
      )}
    </div>
  );
}

// Title Component
interface PanelTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelTitle({ children, className }: PanelTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h2>
  );
}

// Description Component
interface PanelDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelDescription({
  children,
  className,
}: PanelDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}

// Body Component
interface PanelBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelBody({ children, className }: PanelBodyProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-6", className)}>
      {children}
    </div>
  );
}

// Footer Component
interface PanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelFooter({ children, className }: PanelFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Close Button Component (for use anywhere in the panel)
interface PanelCloseProps {
  children?: React.ReactNode;
  asChild?: boolean;
}

export function PanelClose({ children, asChild }: PanelCloseProps) {
  const { closePanel } = useSidePanel();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: closePanel,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  return (
    <Button variant="outline" onClick={closePanel}>
      {children || "Cancel"}
    </Button>
  );
}

// Export the hook for external use
export { useSidePanel };
