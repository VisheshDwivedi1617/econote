
// PenDataInterpreter.ts - Interprets data from the smart pen

export interface PenPoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export interface PenStroke {
  points: PenPoint[];
  color: string;
  width: number;
  id: string;
}

class PenDataInterpreter {
  private calibration = {
    // Default calibration values (can be customized during calibration)
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  };
  
  private isNewStroke = true;
  private currentStrokeId = '';
  private onNewPoint: ((point: PenPoint) => void) | null = null;
  private onNewStroke: ((stroke: PenStroke) => void) | null = null;
  private onStrokeEnd: ((strokeId: string) => void) | null = null;
  private lastTimestamp = 0;
  private strokeBuffer: PenPoint[] = [];
  
  constructor() {
    // Generate a unique ID for the first stroke
    this.currentStrokeId = this.generateStrokeId();
  }
  
  // Process raw data from the pen
  processRawData(data: DataView): void {
    // This implementation is a simplified example
    // Real implementation would depend on the specific protocol of the smart pen
    
    try {
      // Extract coordinates and pressure from the data packet
      // Format is pen-specific, this is an example format:
      // byte 0: packet type (0x01 for pen down, 0x02 for pen move, 0x03 for pen up)
      // bytes 1-4: X coordinate (32-bit float)
      // bytes 5-8: Y coordinate (32-bit float)
      // bytes 9-10: pressure (16-bit int)
      
      const packetType = data.getUint8(0);
      
      // If packet type indicates pen up, end current stroke
      if (packetType === 0x03) {
        this.endStroke();
        return;
      }
      
      // Start a new stroke if this is a pen down event
      if (packetType === 0x01) {
        this.startNewStroke();
      }
      
      // Extract x, y, and pressure
      const rawX = data.getFloat32(1, true); // true = little endian
      const rawY = data.getFloat32(5, true);
      const pressure = data.getUint16(9, true) / 1024; // Normalize to 0-1 range
      
      // Apply calibration
      const point = this.calibratePoint(rawX, rawY, pressure);
      
      // Add timestamp
      const timestamp = Date.now();
      const fullPoint: PenPoint = {
        ...point,
        timestamp
      };
      
      // Add to current stroke
      this.strokeBuffer.push(fullPoint);
      
      // Notify listeners
      if (this.onNewPoint) {
        this.onNewPoint(fullPoint);
      }
      
      // Check if we should send a stroke update
      // (Either buffer is getting large or enough time has passed)
      if (this.strokeBuffer.length > 10 || timestamp - this.lastTimestamp > 100) {
        this.sendStrokeUpdate();
        this.lastTimestamp = timestamp;
      }
    } catch (error) {
      console.error('Error processing pen data:', error);
    }
  }
  
  // Apply calibration to convert raw pen coordinates to screen coordinates
  private calibratePoint(rawX: number, rawY: number, pressure: number): PenPoint {
    // Apply transformations: scale, rotate, offset
    const cosR = Math.cos(this.calibration.rotation);
    const sinR = Math.sin(this.calibration.rotation);
    
    // Scale and rotate
    const rotatedX = rawX * cosR - rawY * sinR;
    const rotatedY = rawX * sinR + rawY * cosR;
    
    // Scale and offset
    const x = rotatedX * this.calibration.scaleX + this.calibration.offsetX;
    const y = rotatedY * this.calibration.scaleY + this.calibration.offsetY;
    
    return { x, y, pressure, timestamp: 0 }; // timestamp will be filled later
  }
  
  // Start a new stroke
  private startNewStroke(): void {
    // End previous stroke if any
    if (!this.isNewStroke) {
      this.endStroke();
    }
    
    this.currentStrokeId = this.generateStrokeId();
    this.isNewStroke = false;
    this.strokeBuffer = [];
  }
  
  // End the current stroke
  private endStroke(): void {
    this.sendStrokeUpdate();
    
    if (this.onStrokeEnd) {
      this.onStrokeEnd(this.currentStrokeId);
    }
    
    this.isNewStroke = true;
    this.strokeBuffer = [];
  }
  
  // Send accumulated points as a stroke update
  private sendStrokeUpdate(): void {
    if (this.strokeBuffer.length === 0) return;
    
    if (this.onNewStroke) {
      const stroke: PenStroke = {
        points: [...this.strokeBuffer],
        color: '#000000', // Default color
        width: 2,         // Default width
        id: this.currentStrokeId
      };
      
      this.onNewStroke(stroke);
    }
    
    // Clear buffer after sending
    this.strokeBuffer = [];
  }
  
  // Generate a unique ID for strokes
  private generateStrokeId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // Set calibration parameters
  setCalibration(params: Partial<typeof this.calibration>): void {
    this.calibration = { ...this.calibration, ...params };
  }
  
  // Get current calibration
  getCalibration(): typeof this.calibration {
    return { ...this.calibration };
  }
  
  // Set event handlers
  setOnNewPoint(callback: (point: PenPoint) => void): void {
    this.onNewPoint = callback;
  }
  
  setOnNewStroke(callback: (stroke: PenStroke) => void): void {
    this.onNewStroke = callback;
  }
  
  setOnStrokeEnd(callback: (strokeId: string) => void): void {
    this.onStrokeEnd = callback;
  }
}

export default new PenDataInterpreter();
