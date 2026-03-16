import { motion } from "framer-motion";

const pieces = ["♔", "♛", "♜", "♝", "♞", "♟"];

export default function ChessLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="flex gap-3 mb-6">
        {pieces.map((p, i) => (
          <motion.span
            key={i}
            className="text-3xl text-primary"
            initial={{ y: 0, opacity: 0.3 }}
            animate={{ y: [0, -16, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          >
            {p}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="w-48 h-1 rounded-full bg-muted overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.p
        className="mt-4 text-sm text-muted-foreground font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Loading your game...
      </motion.p>
    </div>
  );
}
