
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flashcard as FlashcardType } from "@/models/StudyModels";
import { motion } from "framer-motion";

interface FlashcardProps {
  flashcard: FlashcardType;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const Flashcard = ({ 
  flashcard, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious 
}: FlashcardProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [direction, setDirection] = useState(0);
  
  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };
  
  const handleNext = () => {
    setDirection(1);
    setShowAnswer(false);
    
    // Small delay to allow animation to start before changing card
    setTimeout(() => {
      onNext();
    }, 200);
  };
  
  const handlePrevious = () => {
    setDirection(-1);
    setShowAnswer(false);
    
    // Small delay to allow animation to start before changing card
    setTimeout(() => {
      onPrevious();
    }, 200);
  };
  
  return (
    <div className="w-full max-w-md mx-auto py-6">
      <motion.div 
        key={flashcard.id}
        initial={{ 
          x: direction * 200,
          opacity: 0 
        }}
        animate={{ 
          x: 0,
          opacity: 1 
        }}
        exit={{ 
          x: direction * -200,
          opacity: 0 
        }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card 
          className={`w-full h-64 cursor-pointer ${
            showAnswer ? "bg-green-50 dark:bg-green-900/20" : "bg-white dark:bg-gray-800"
          } transition-colors duration-300`}
          onClick={handleFlip}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-6">
            <div className="text-center">
              {showAnswer ? (
                <div>
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Answer:
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {flashcard.answer}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Question:
                  </div>
                  <div className="text-lg">
                    {flashcard.question}
                  </div>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-400">
                Tap card to {showAnswer ? "see question" : "reveal answer"}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={!hasPrevious}
        >
          Previous
        </Button>
        <Button 
          variant="default" 
          onClick={handleNext}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Flashcard;
