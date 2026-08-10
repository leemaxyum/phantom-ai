import { motion, AnimatePresence } from "framer-motion";

interface VideoOverlayProps {
  open: boolean;
  onFinished: () => void;
}

export function VideoOverlay({ open, onFinished }: VideoOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <video
            src="/eastereggs/youneverseeit.mp4"
            autoPlay
            playsInline
            onEnded={onFinished}
            className="h-full w-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}