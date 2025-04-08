
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Pen, BatteryFull, PenTool, Loader2,
  Bluetooth, BluetoothOff, CalendarRange,
  Save, Laptop
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import BluetoothService from "@/services/BluetoothService";
import PenDataInterpreter from "@/services/PenDataInterpreter";
import CalibrationTool from "@/components/calibration/CalibrationTool";
import { useNotebook } from "@/contexts/NotebookContext";

interface PenStatusProps {
  className?: string;
  onPenData?: (data: any) => void;
}

const PenStatus = ({ className, onPenData }: PenStatusProps) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [penName, setPenName] = useState("Smart Pen");
  const [showCalibration, setShowCalibration] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const { toast } = useToast();
  const { addStroke } = useNotebook();

  useEffect(() => {
    // Set up event handlers for Bluetooth service
    BluetoothService.onConnectionChange = (isConnected) => {
      setConnected(isConnected);
      setConnecting(false);
      
      if (isConnected) {
        const deviceInfo = BluetoothService.getDeviceInfo();
        if (deviceInfo) {
          setPenName(deviceInfo.name);
        }
        
        toast({
          title: "Pen Connected",
          description: `Successfully connected to ${penName}`,
        });
      } else {
        toast({
          title: "Pen Disconnected",
          description: "Your smart pen has been disconnected",
          variant: "destructive",
        });
      }
    };
    
    // Set up battery level handler
    BluetoothService.onBatteryLevel = (level) => {
      setBatteryLevel(level);
    };
    
    // Set up data handler for the pen
    BluetoothService.onDataReceived = (data) => {
      // Process the raw data through the interpreter
      PenDataInterpreter.processRawData(data);
    };
    
    // Set up handlers for the interpreter
    PenDataInterpreter.setOnNewStroke((stroke) => {
      // Add to notebook context
      addStroke(stroke);
      
      // Also call the original handler if provided
      if (onPenData) {
        onPenData({
          type: 'stroke',
          data: stroke
        });
      }
    });
    
    return () => {
      // Clean up
      BluetoothService.onConnectionChange = null;
      BluetoothService.onBatteryLevel = null;
      BluetoothService.onDataReceived = null;
      PenDataInterpreter.setOnNewStroke(null);
    };
  }, [onPenData, penName, toast, addStroke]);
  
  // Handle connect/disconnect
  const handleConnect = async () => {
    if (connected) {
      await BluetoothService.disconnect();
      return;
    }
    
    setConnecting(true);
    
    try {
      // Check for Web Bluetooth API support
      if (!navigator.bluetooth) {
        toast({
          title: "Bluetooth Not Supported",
          description: "Your browser doesn't support the Web Bluetooth API. Try using Chrome or Edge.",
          variant: "destructive",
        });
        setConnecting(false);
        return;
      }
      
      // Scan for devices
      const devices = await BluetoothService.scanForDevices();
      
      if (devices.length === 0) {
        toast({
          title: "No Devices Found",
          description: "No smart pen devices were found. Make sure your pen is on and in pairing mode.",
          variant: "destructive",
        });
        setConnecting(false);
        return;
      }
      
      // Connect to the first device (in a real app, you might show a selection UI)
      const success = await BluetoothService.connect(devices[0]);
      
      if (!success) {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the smart pen. Please try again.",
          variant: "destructive",
        });
        setConnecting(false);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: "There was an error connecting to your pen. Please try again.",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };
  
  // Open calibration
  const handleCalibrate = () => {
    if (!connected && !isOfflineMode) {
      toast({
        title: "Pen Not Connected",
        description: "Please connect your pen before calibrating",
        variant: "destructive",
      });
      return;
    }
    
    setShowCalibration(true);
  };
  
  // Toggle offline mode
  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
    
    if (!isOfflineMode) {
      toast({
        title: "Offline Mode Enabled",
        description: "You can now use the app without a pen connection.",
      });
    } else {
      toast({
        title: "Offline Mode Disabled",
        description: "Connect your pen to continue.",
      });
    }
  };
  
  // For demo purposes - simulate connection
  const simulateConnection = () => {
    setConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      setPenName("Demo Smart Pen");
      
      toast({
        title: "Pen Connected (Demo)",
        description: "This is a simulated connection for demonstration purposes",
      });
      
      // Start draining battery
      const interval = setInterval(() => {
        setBatteryLevel((prev) => {
          // Randomly decrease battery between 0 and 1%
          const newLevel = prev - Math.random();
          return newLevel < 0 ? 0 : newLevel;
        });
      }, 30000);
      
      // Clear interval when component unmounts
      return () => clearInterval(interval);
    }, 2000);
  };
  
  return (
    <>
      <div className={cn(
        "fixed left-6 bottom-6 bg-white rounded-full shadow-lg px-4 py-2 z-10 flex items-center gap-3",
        className
      )}>
        <div className={cn(
          "w-3 h-3 rounded-full transition-colors",
          connected ? "bg-green-500" : isOfflineMode ? "bg-yellow-500" : "bg-gray-300"
        )} />
        
        <div className="text-sm">
          <div className="font-medium">{isOfflineMode ? "Offline Mode" : penName}</div>
          <div className="text-xs text-gray-500">
            {connected 
              ? `Connected • ${Math.round(batteryLevel)}% battery` 
              : isOfflineMode
              ? "Using local storage"
              : "Disconnected"}
          </div>
        </div>
        
        {connected && (
          <div className="flex gap-2 ml-2">
            <Bluetooth className="h-4 w-4 text-blue-500" />
            <BatteryFull className="h-4 w-4 text-green-500" />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button
            variant={connected || isOfflineMode ? "outline" : "default"}
            size="sm"
            className={cn(
              connecting && "opacity-80"
            )}
            disabled={connecting}
            onClick={isOfflineMode ? toggleOfflineMode : handleConnect}
            title={isOfflineMode ? "Disable Offline Mode" : connected ? "Disconnect Pen" : "Connect Pen"}
          >
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                <span>Connecting</span>
              </>
            ) : connected ? (
              <>
                <BluetoothOff className="h-4 w-4 mr-1" />
                <span>Disconnect</span>
              </>
            ) : isOfflineMode ? (
              <>
                <Bluetooth className="h-4 w-4 mr-1" />
                <span>Go Online</span>
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4 mr-1" />
                <span>Connect Pen</span>
              </>
            )}
          </Button>
          
          {!isOfflineMode && !connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOfflineMode}
              title="Enable Offline Mode"
            >
              <Laptop className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Offline Mode</span>
            </Button>
          )}
          
          {(connected || isOfflineMode) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCalibrate}
                title="Calibrate Pen"
              >
                <CalendarRange className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                title="Sync Notes"
              >
                <Save className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* For demo purposes only */}
          {!connected && !connecting && !isOfflineMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={simulateConnection}
              className="ml-1"
            >
              <PenTool className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Simulate Pen</span>
            </Button>
          )}
        </div>
      </div>
      
      <CalibrationTool
        isOpen={showCalibration}
        onClose={() => setShowCalibration(false)}
      />
    </>
  );
};

export default PenStatus;
