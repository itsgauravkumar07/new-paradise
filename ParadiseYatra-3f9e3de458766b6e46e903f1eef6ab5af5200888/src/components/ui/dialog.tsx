"use client";

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

const DialogContext = React.createContext<{
    onOpenChange?: (open: boolean) => void;
}>({});

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    // Escape key listener
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange?.(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onOpenChange]);

    // Prevent scrolling when dialog is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const dialogContent = (
        <DialogContext.Provider value={{ onOpenChange }}>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
                            onClick={() => onOpenChange?.(false)}
                        />
                        <div className="relative z-[101] w-full max-w-lg pointer-events-none flex items-center justify-center h-full">
                            {children}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </DialogContext.Provider>
    );

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return createPortal(dialogContent, document.body);
}

const DialogContent = React.forwardRef<
    HTMLDivElement,
    Omit<HTMLMotionProps<"div">, "children"> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "relative flex w-full max-h-[90vh] flex-col bg-white shadow-2xl rounded-[6px] border border-[#dfe1df] overflow-hidden pointer-events-auto",
                className
            )}
            {...props}
        >
            {/* Close Button Inside */}
            <button
                onClick={() => onOpenChange?.(false)}
                className="absolute top-4 right-4 z-50 p-1.5 text-[#000945] opacity-50 hover:opacity-100 transition-all cursor-pointer active:scale-90"
                aria-label="Close"
            >
                <X className="w-5 h-5" />
            </button>
            {children}
        </motion.div>
    );
});
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-bold leading-none tracking-tight text-[#000945]",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogContent, DialogHeader, DialogTitle }
