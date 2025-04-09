
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/models/StudyModels";
import { motion } from "framer-motion";

interface QuizCardProps {
  quiz: Quiz;
  onNext: () => void;
  onPrevious: () => void;
  onAnswer: (isCorrect: boolean) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const QuizCard = ({ 
  quiz, 
  onNext, 
  onPrevious, 
  onAnswer, 
  hasNext, 
  hasPrevious 
}: QuizCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [direction, setDirection] = useState(0);
  
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const isCorrect = answer === quiz.correctAnswer;
    onAnswer(isCorrect);
  };
  
  const handleNext = () => {
    setDirection(1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    
    // Small delay to allow animation to start before changing card
    setTimeout(() => {
      onNext();
    }, 200);
  };
  
  const handlePrevious = () => {
    setDirection(-1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    
    // Small delay to allow animation to start before changing card
    setTimeout(() => {
      onPrevious();
    }, 200);
  };
  
  const getButtonVariant = (option: string) => {
    if (!isAnswered) return "outline";
    
    if (option === quiz.correctAnswer) {
      return "success";
    }
    
    if (option === selectedAnswer && option !== quiz.correctAnswer) {
      return "destructive";
    }
    
    return "outline";
  };
  
  // Custom success variant for the button
  const successClass = 
    "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500";
  
  return (
    <div className="w-full max-w-md mx-auto py-6">
      <motion.div 
        key={quiz.id}
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
        <Card className="w-full mb-4">
          <CardContent className="pt-6">
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Question:
            </div>
            <div className="text-lg mb-6">
              {quiz.question}
            </div>
            
            <div className="space-y-3">
              {quiz.options.map((option, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(option) as "outline" | "destructive" | "default"}
                  className={`w-full justify-start text-left ${
                    option === quiz.correctAnswer && isAnswered ? successClass : ""
                  }`}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isAnswered && selectedAnswer !== option && option !== quiz.correctAnswer}
                >
                  {option}
                </Button>
              ))}
            </div>
            
            {isAnswered && (
              <div className="mt-4 text-center">
                {selectedAnswer === quiz.correctAnswer ? (
                  <div className="text-green-600 dark:text-green-400 font-medium">
                    Correct!
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400 font-medium">
                    Incorrect. The correct answer is: {quiz.correctAnswer}
                  </div>
                )}
              </div>
            )}
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
          onClick={handleNext}
          disabled={!isAnswered || !hasNext}
        >
          {hasNext ? "Next" : "Finish"}
        </Button>
      </div>
    </div>
  );
};

export default QuizCard;
