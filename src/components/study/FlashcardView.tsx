
import React from "react";
import { Flashcard } from "@/models/StudyModels";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardViewProps {
  flashcard: Flashcard;
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcard,
  current,
  total,
  onNext,
  onPrev,
  onBack
}) => {
  const [showAnswer, setShowAnswer] = React.useState(false);

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to Study
          </Button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Card {current} of {total}
          </div>
        </div>

        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: showAnswer ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="w-full perspective-1000"
        >
          <Card 
            className={`w-full min-h-[240px] cursor-pointer transition-colors duration-300 ${
              showAnswer ? "bg-green-50 dark:bg-green-900/20" : "bg-white dark:bg-gray-800"
            }`}
            onClick={handleFlip}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-center">
                {showAnswer ? (
                  <div style={{ transform: "rotateX(180deg)" }}>
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
                  Click card to {showAnswer ? "see question" : "reveal answer"}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={onPrev}
            disabled={current === 1}
          >
            Previous
          </Button>
          <Button 
            variant="default" 
            onClick={onNext}
            disabled={current === total}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;
