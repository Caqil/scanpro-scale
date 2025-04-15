import { useState, useEffect } from 'react';

// Text recognition animation stages
const recognitionStages = [
  { min: 0, max: 10, text: "Analyzing document structure..." },
  { min: 10, max: 25, text: "Detecting text areas..." },
  { min: 25, max: 40, text: "Processing page content..." },
  { min: 40, max: 60, text: "Recognizing characters..." },
  { min: 60, max: 75, text: "Extracting text..." },
  { min: 75, max: 85, text: "Applying language processing..." },
  { min: 85, max: 95, text: "Finalizing extraction..." },
  { min: 95, max: 100, text: "Completing OCR process..." }
];

// Sample OCR extraction text (will be shown character by character)
const sampleTextSnippets = [
  "Extracting: The quick brown fox jumps over the lazy dog.",
  "Recognized: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Processing: To be or not to be, that is the question.",
  "Analyzing: All that glitters is not gold.",
  "Scanning: In the beginning God created the heavens and the earth.",
  "Reading: Four score and seven years ago our fathers brought forth...",
  "Detected: It was the best of times, it was the worst of times.",
  "Found: Ask not what your country can do for you..."
];

interface AnimatedOcrTextProps {
  progress: number;
}

export function AnimatedOcrText({ progress }: AnimatedOcrTextProps) {
  const [animatedText, setAnimatedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Find the current stage based on progress
  const currentStage = recognitionStages.find(
    stage => progress >= stage.min && progress <= stage.max
  ) || recognitionStages[0];

  // Change the sample text snippet based on progress
  useEffect(() => {
    // Determine which stage we're in based on the progress
    const stageIndex = recognitionStages.findIndex(
      stage => progress >= stage.min && progress <= stage.max
    );
    
    // If invalid index, use the first stage
    const validStageIndex = stageIndex >= 0 ? stageIndex : 0;
    
    // Map the stage index to a text snippet index
    const textIndex = validStageIndex % sampleTextSnippets.length;
    
    // Only reset animation if we've moved to a different text
    if (textIndex !== currentTextIndex) {
      setCurrentTextIndex(textIndex);
      setCurrentCharIndex(0);
      setAnimatedText("");
      setIsTyping(true);
    }
  }, [progress, currentTextIndex]);

  // Typing animation effect
  useEffect(() => {
    if (!isTyping) return;
    
    const currentText = sampleTextSnippets[currentTextIndex];
    
    if (currentCharIndex < currentText.length) {
      // Type characters one by one with a random delay
      const typingSpeed = 30 + Math.random() * 50; // Random typing speed between 30-80ms
      
      const timer = setTimeout(() => {
        setAnimatedText(currentText.substring(0, currentCharIndex + 1));
        setCurrentCharIndex(prevIndex => prevIndex + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    } else {
      // When typing is complete, wait for a moment before resetting
      setIsTyping(false);
      
      const resetTimer = setTimeout(() => {
        // Calculate next text index, avoiding changing based on progress which might not have changed
        const nextTextIndex = (currentTextIndex + 1) % sampleTextSnippets.length;
        setCurrentTextIndex(nextTextIndex);
        setCurrentCharIndex(0);
        setAnimatedText("");
        setIsTyping(true);
      }, 2000); // Wait 2 seconds before starting the next text
      
      return () => clearTimeout(resetTimer);
    }
  }, [currentCharIndex, currentTextIndex, isTyping]);

  return (
    <div className="space-y-2">
      <p className="font-semibold text-primary">{currentStage.text}</p>
      <div className="h-8 text-xs font-mono bg-muted/50 p-1.5 rounded border overflow-hidden">
        <span>{animatedText}</span>
        <span className="inline-block w-1.5 h-3 bg-primary/70 ml-0.5 animate-pulse"></span>
      </div>
    </div>
  );
}