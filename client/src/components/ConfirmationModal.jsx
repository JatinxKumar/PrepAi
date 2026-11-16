import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
}) {
    const variantStyles = {
        danger: {
            iconColor: "text-[#D02020]",
            borderColor: "border-[#D02020]",
            buttonBg: "bg-[#D02020]",
            buttonHover: "hover:bg-red-700",
        },
        warning: {
            iconColor: "text-[#F0C020]",
            borderColor: "border-[#F0C020]",
            buttonBg: "bg-[#F0C020]",
            buttonHover: "hover:bg-yellow-600",
        },
        info: {
            iconColor: "text-[#1040C0]",
            borderColor: "border-[#1040C0]",
            buttonBg: "bg-[#1040C0]",
            buttonHover: "hover:bg-blue-800",
        },
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg shadow-xl border-2 border-[#111111] w-full max-w-md mx-4 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black uppercase font-['Outfit'] text-[#111111]">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 text-[#555555] hover:text-[#111111] transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-['JetBrains_Mono'] text-[#555555] leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 text-xs font-black uppercase font-['JetBrains_Mono'] border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#F0F0F0] transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-4 py-2.5 text-xs font-black uppercase font-['JetBrains_Mono'] border-2 border-[#111111] ${styles.buttonBg} ${styles.buttonHover} text-white transition-all shadow-[3px_3px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}