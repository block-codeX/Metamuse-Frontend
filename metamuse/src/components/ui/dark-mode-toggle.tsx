import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  size?: number;
  isDark: boolean;
  toggleDark: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  size = 24,
  isDark,
  toggleDark,
}) => {
  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={toggleDark}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.95 }}
      initial={false}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 45 : 0,
          opacity: isDark ? 0 : 1,
          scale: isDark ? 0.5 : 1
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <Sun size={size} strokeWidth={1.5} className='text-secondary' />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 0 : -45,
          opacity: isDark ? 1 : 0,
          scale: isDark ? 1 : 0.5
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <Moon size={size}  strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
};

export default DarkModeToggle;