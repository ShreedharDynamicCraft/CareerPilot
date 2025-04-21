import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const platforms = [
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-500' },
  { id: 'indeed', name: 'Indeed', color: 'bg-blue-400' },
  { id: 'internshala', name: 'Internshala', color: 'bg-green-500' }
];

export default function JobFilters({ filters, setFilters }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePlatform = (platformId) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg"
    >
      <motion.h2 
        className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500"
        variants={itemVariants}
      >
        Job Search Filters
      </motion.h2>
      
      <div className="space-y-8">
        <motion.div variants={itemVariants} className="space-y-3">
          <Label className="block text-lg font-medium text-gray-700">Platforms</Label>
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <motion.div
                key={platform.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${filters.platforms.includes(platform.id) ? platform.color : 'bg-white'} 
                  rounded-full px-4 py-2 flex items-center space-x-2 shadow-md cursor-pointer
                  transition-all duration-300 ease-in-out border border-gray-200`}
                onClick={() => togglePlatform(platform.id)}
              >
                <Checkbox
                  id={`platform-${platform.id}`}
                  checked={filters.platforms.includes(platform.id)}
                  className="transition-all duration-300"
                />
                <Label 
                  htmlFor={`platform-${platform.id}`}
                  className={`${filters.platforms.includes(platform.id) ? 'text-white font-medium' : 'text-gray-700'} cursor-pointer`}
                >
                  {platform.name}
                </Label>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="flex justify-center mt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full shadow-lg"
          >
            Apply Filters
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}