import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
