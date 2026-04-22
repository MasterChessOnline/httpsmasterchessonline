import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        // High-contrast gold primary with visible edge + shadow
        default:
          "bg-primary text-primary-foreground border border-primary/60 shadow-[0_2px_8px_rgba(0,0,0,0.4),0_0_0_1px_hsl(var(--primary)/0.25),inset_0_1px_0_hsl(var(--primary-foreground)/0.18)] hover:bg-primary/95 hover:shadow-[0_6px_20px_rgba(212,175,55,0.35),0_0_0_1px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive/60 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-destructive/95 hover:shadow-[0_6px_20px_hsl(var(--destructive)/0.4)] hover:-translate-y-0.5",
        // Outline now has clear visible border + dark fill so it never disappears
        outline:
          "bg-card/80 text-foreground border border-border shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:bg-card hover:border-primary/50 hover:text-primary hover:shadow-[0_6px_18px_rgba(0,0,0,0.4),0_0_0_1px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground border border-secondary/60 shadow-[0_2px_8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-secondary/85 hover:shadow-[0_6px_18px_rgba(0,0,0,0.45)] hover:-translate-y-0.5",
        // Ghost gets a subtle visible base on hover so it never blends into the bg
        ghost:
          "text-foreground/90 border border-transparent hover:bg-card hover:text-foreground hover:border-border hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
