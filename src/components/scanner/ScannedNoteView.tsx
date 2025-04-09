
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ScannedNoteViewProps {
  imageData: string;
  className?: string;
}

const ScannedNoteView: React.FC<ScannedNoteViewProps> = ({ imageData, className }) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <img 
          src={imageData} 
          alt="Scanned Note" 
          className="w-full h-auto object-contain"
        />
      </CardContent>
    </Card>
  );
};

export default ScannedNoteView;
