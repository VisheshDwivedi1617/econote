
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pen, Wifi, BatteryFull, PenTool, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PenStatusProps {
  className?: string;
}

const PenStatus = ({ className }: PenStatusProps) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  
  // Simulate connection process
  const handleConnect = () => {
    if (connected) {
      setConnected(false);
      return;
    }
    
    setConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
    }, 2000);
  };
  
  // Simulate battery drain
  useEffect(() => {
    if (!connected) return;
    
    const interval = setInterval(() => {
      setBatteryLevel((prev) => {
        // Randomly decrease battery between 0 and 1%
        const newLevel = prev - Math.random();
        return newLevel < 0 ? 0 : newLevel;
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [connected]);
  
  return (
    <div className={cn(
      "fixed left-6 bottom-6 bg-white rounded-full shadow-lg px-4 py-2 z-10 flex items-center gap-3",
      className
    )}>
      <div className={cn(
        "w-3 h-3 rounded-full transition-colors",
        connected ? "bg-green-500" : "bg-gray-300"
      )} />
      
      <div className="text-sm">
        <div className="font-medium">Smart Pen</div>
        <div className="text-xs text-gray-500">
          {connected 
            ? `Connected • ${Math.round(batteryLevel)}% battery` 
            : "Disconnected"}
        </div>
      </div>
      
      {connected && (
        <div className="flex gap-2 ml-2">
          <Wifi className="h-4 w-4 text-green-500" />
          <BatteryFull className="h-4 w-4 text-blue-500" />
        </div>
      )}
      
      <Button
        variant={connected ? "outline" : "default"}
        size="sm"
        className={cn(
          "ml-2",
          connecting && "opacity-80"
        )}
        disabled={connecting}
        onClick={handleConnect}
      >
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            <span>Connecting</span>
          </>
        ) : connected ? (
          <>
            <PenTool className="h-4 w-4 mr-1" />
            <span>Disconnect</span>
          </>
        ) : (
          <>
            <Pen className="h-4 w-4 mr-1" />
            <span>Connect Pen</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default PenStatus;
