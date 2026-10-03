import { motion } from "framer-motion";
import { FileUp } from "lucide-react";
import { useState } from "react";

export default function PremiumUploadArea({
  onFileSelect,
  isLoading,
  fileName,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect?.(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length > 0) {
      onFileSelect?.(e.target.files[0]);
    }
  };

  return (
    <motion.label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      animate={{
        borderColor: isDragging
          ? "rgba(34, 211, 238, 0.5)"
          : "rgba(34, 211, 238, 0.2)",
        backgroundColor: isDragging
          ? "rgba(34, 211, 238, 0.05)"
          : "rgba(34, 211, 238, 0)",
      }}
      className="group relative flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-white/5 to-purple-500/10 px-8 py-12 text-center cursor-pointer transition-all overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent"
        animate={{
          x: [-1000, 1000],
          opacity: isDragging ? 1 : 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Glow effect on hover/drag */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] bg-radial-gradient opacity-0"
        animate={{
          opacity: isDragging ? 0.4 : 0,
          scale: isDragging ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1), transparent 70%)",
        }}
      />

      {/* Floating file icon */}
      <motion.div
        className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 border border-cyan-300/30 flex items-center justify-center backdrop-blur-xl"
        animate={{
          y: isDragging ? -8 : [0, -6, 0],
          scale: isDragging ? 1.1 : 1,
        }}
        transition={{
          y: isDragging
            ? { type: "spring", stiffness: 300 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {isLoading ? (
          <motion.div
            className="w-6 h-6 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <FileUp className="w-7 h-7 text-cyan-300" />
        )}
      </motion.div>

      {/* Text content */}
      <div className="relative z-10">
        <p className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
          {fileName ? (
            <span className="text-cyan-300">{fileName}</span>
          ) : (
            <>
              <span className="block sm:inline">Drop your resume</span>
              <span className="text-gray-400"> or click to browse</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOCX, TXT, or MD • Max 10MB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Decorative elements */}
      <motion.div
        className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400"
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-purple-400"
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
    </motion.label>
  );
}
