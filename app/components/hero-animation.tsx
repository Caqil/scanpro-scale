"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, FileBadge2Icon, Scissors, Lock, PenTool, Type, Layers, Eye } from 'lucide-react';

interface Stage {
  name: 'convert' | 'compress' | 'split' | 'protect' | 'sign' | 'watermark' | 'merge' | 'ocr';
  icon: React.ForwardRefExoticComponent<any>;
  color: string;
  actionText: string;
}

const stages: Stage[] = [
  { name: 'convert', icon: ChevronRight, color: 'text-blue-500', actionText: 'Converting to DOCX' },
  { name: 'compress', icon: FileBadge2Icon, color: 'text-green-500', actionText: 'Compressing PDF' },
  { name: 'split', icon: Scissors, color: 'text-orange-500', actionText: 'Splitting Pages' },
  { name: 'protect', icon: Lock, color: 'text-purple-500', actionText: 'Protecting PDF' },
  { name: 'sign', icon: PenTool, color: 'text-indigo-500', actionText: 'Signing PDF' },
  { name: 'watermark', icon: Type, color: 'text-teal-500', actionText: 'Watermarking PDF' },
  { name: 'merge', icon: Layers, color: 'text-red-500', actionText: 'Merging PDFs' },
  { name: 'ocr', icon: Eye, color: 'text-yellow-500', actionText: 'OCR Processing' },
];

const HeroAnimation = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isAnimating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setAnimating(true);
        setTimeout(() => {
          setCurrentStageIndex((prev) => (prev + 1) % stages.length);
          setAnimating(false);
        }, 2000); // Animation duration
      }
    }, 3000); // Total cycle time

    return () => clearInterval(interval);
  }, [isAnimating]);

  const currentStage = stages[currentStageIndex];

  const PDFCard = ({ active = false, variant = 'default' }: { active?: boolean; variant?: 'default' | 'small' }) => (
    <motion.div
      className={`relative flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 p-${variant === 'small' ? 4 : 6} rounded-xl`}
      whileHover={{ scale: 1.05 }}
      animate={active ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
    >
      <FileText className={`h-${variant === 'small' ? 8 : 12} w-${variant === 'small' ? 8 : 12} text-red-500 ${active ? 'animate-pulse' : ''}`} />
      <div className="mt-2 text-center">
        <div className={`text-${variant === 'small' ? 'base' : 'lg'} font-semibold`}>PDF</div>
        <div className="text-xs text-muted-foreground">Document</div>
      </div>
    </motion.div>
  );

  const StageEffect = () => {
    switch (currentStage.name) {
      case 'convert':
        return (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 50, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute flex items-center"
          >
            <FileText className="h-12 w-12 text-blue-500" />
            <motion.div className="ml-2 text-sm font-medium text-blue-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              DOCX
            </motion.div>
          </motion.div>
        );
      case 'compress':
        return (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 1 }}
            animate={{ scale: 0.7 }}
            transition={{ duration: 1.5 }}
          >
            <PDFCard variant="small" />
          </motion.div>
        );
      case 'split':
        return (
          <motion.div
            className="absolute inset-0 flex items-center justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div initial={{ x: 0 }} animate={{ x: -40 }} transition={{ duration: 1.5 }}>
              <PDFCard variant="small" />
            </motion.div>
            <motion.div initial={{ x: 0 }} animate={{ x: 40 }} transition={{ duration: 1.5 }}>
              <PDFCard variant="small" />
            </motion.div>
          </motion.div>
        );
      case 'protect':
        return (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <Lock className="h-10 w-10 text-purple-500" />
          </motion.div>
        );
      case 'sign':
        return (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1.5 }}
          >
            <PenTool className="h-10 w-10 text-indigo-500" />
          </motion.div>
        );
      case 'watermark':
        return (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <span className="text-teal-500 text-lg font-semibold transform -rotate-12">WATERMARK</span>
          </motion.div>
        );
      case 'merge':
        return (
          <motion.div
            className="absolute inset-0 flex items-center justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.5 }}>
              <PDFCard variant="small" />
            </motion.div>
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.5 }}>
              <PDFCard variant="small" />
            </motion.div>
          </motion.div>
        );
      case 'ocr':
        return (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <Eye className="h-10 w-10 text-yellow-500" />
            <motion.div
              className="absolute inset-0 bg-yellow-200/20 rounded-xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto h-72 flex items-center justify-center">
    

      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="grid grid-cols-3 items-center w-full px-8">
          <div className="flex justify-end">
            <PDFCard active={!isAnimating} />
          </div>

          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: isAnimating ? 360 : 0 }}
              transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0, ease: "linear" }}
              className="bg-primary/10 rounded-full p-3"
            >
              <currentStage.icon className={`h-8 w-8 ${currentStage.color}`} />
            </motion.div>
            <motion.div
              className={`mt-2 text-sm font-medium ${currentStage.color}`}
              key={currentStage.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {currentStage.actionText}
            </motion.div>
          </div>

          <div className="flex justify-start relative">
            <AnimatePresence mode="wait">
              {isAnimating && (
                <motion.div
                  key={currentStage.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <StageEffect />
                </motion.div>
              )}
              {!isAnimating && <PDFCard active={false} />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute -bottom-12 flex justify-center flex-wrap gap-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {stages.map((stage, index) => (
          <motion.button
            key={stage.name}
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
            onClick={() => setCurrentStageIndex(index)}
          >
            <div className={`h-1 w-8 rounded-full mb-1 ${index === currentStageIndex ? 'bg-primary' : 'bg-muted/50'}`} />
            <span className={`text-xs ${index === currentStageIndex ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {stage.name.charAt(0).toUpperCase() + stage.name.slice(1)}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default HeroAnimation;