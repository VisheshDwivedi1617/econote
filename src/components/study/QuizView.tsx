
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/models/StudyModels";
import { motion } from "framer-motion";

interface QuizViewProps {
  quiz: Quiz;
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  current,
  total,
  onNext,
  onPrev,
  onBack
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
  };
  
  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    onNext();
  };
  
  const handlePrevious = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    onPrev();
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
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to Study
          </Button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Question {current} of {total}
          </div>
        </div>

        <motion.div
          key={quiz.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                      option === quiz.correctAnswer && isAnswered ? "bg-green-500 text-white hover:bg-green-600" : ""
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
            disabled={current === 1}
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!isAnswered || current === total}
          >
            {current === total ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
