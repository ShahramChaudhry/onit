import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import './CompletionCelebration.css'

function CompletionCelebration({ taskTitle, onClose }) {
  return (
    <motion.div
      className="celebration-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="celebration-content"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <motion.div
          className="celebration-icon"
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.6 }}
        >
          <CheckCircle size={64} />
        </motion.div>
        
        <h2 className="celebration-title">Task Completed! 🎉</h2>
        <p className="celebration-subtitle">"{taskTitle}"</p>
        
        <div className="confetti">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="confetti-piece"
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 1,
                rotate: 0
              }}
              animate={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                opacity: 0,
                rotate: Math.random() * 720 - 360
              }}
              transition={{
                duration: 1 + Math.random(),
                ease: 'easeOut'
              }}
              style={{
                background: `hsl(${Math.random() * 360}, 70%, 60%)`
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CompletionCelebration
