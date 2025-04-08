
// BluetoothService.ts - Handles Bluetooth communication with smart pens

// Smart pen device filters - common smart pen service UUIDs
const SMART_PEN_FILTERS = [
  // Generic BLE UART service used by many smart pens
  { services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] },
  // Livescribe pen service
  { services: ['00001523-1212-efde-1523-785feabcd123'] },
  // Add other known pen services here
];

// Characteristics for data transmission
const PEN_DATA_CHARACTERISTIC = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const PEN_CONTROL_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

class BluetoothService {
  device: BluetoothDevice | null = null;
  server: BluetoothRemoteGATTServer | null = null;
  dataCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  controlCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  connected: boolean = false;
  onDataReceived: ((data: DataView) => void) | null = null;
  onConnectionChange: ((connected: boolean) => void) | null = null;
  onBatteryLevel: ((level: number) => void) | null = null;
  
  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      // Request the device through browser's Web Bluetooth API
      const device = await navigator.bluetooth.requestDevice({
        filters: SMART_PEN_FILTERS,
        optionalServices: ['battery_service']
      });
      
      return [device]; // For simplicity we return just the selected device
    } catch (error) {
      console.error('Error scanning for devices:', error);
      return [];
    }
  }
  
  async connect(device: BluetoothDevice): Promise<boolean> {
    try {
      this.device = device;
      
      // Set up event listener for disconnection
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection.bind(this));
      
      // Connect to the device's GATT server
      this.server = await this.device.gatt?.connect();
      if (!this.server) throw new Error('Failed to connect to GATT server');
      
      // Get primary service for pen data
      const primaryService = await this.server.getPrimaryService(SMART_PEN_FILTERS[0].services[0]);
      
      // Get characteristics for sending/receiving data
      this.dataCharacteristic = await primaryService.getCharacteristic(PEN_DATA_CHARACTERISTIC);
      this.controlCharacteristic = await primaryService.getCharacteristic(PEN_CONTROL_CHARACTERISTIC);
      
      // Start notifications for receiving data
      await this.dataCharacteristic.startNotifications();
      this.dataCharacteristic.addEventListener('characteristicvaluechanged', 
        this.handleDataReceived.bind(this));
      
      // Try to get battery service if available
      try {
        const batteryService = await this.server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        
        // Read battery level once
        const batteryValue = await batteryChar.readValue();
        const batteryLevel = batteryValue.getUint8(0);
        if (this.onBatteryLevel) this.onBatteryLevel(batteryLevel);
        
        // Set up notifications for battery changes
        await batteryChar.startNotifications();
        batteryChar.addEventListener('characteristicvaluechanged', (event: Event) => {
          const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
          if (value && this.onBatteryLevel) {
            this.onBatteryLevel(value.getUint8(0));
          }
        });
      } catch (e) {
        // Battery service might not be available on all pens, ignore error
        console.log('Battery service not available on this pen');
      }
      
      this.connected = true;
      if (this.onConnectionChange) this.onConnectionChange(true);
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.disconnect();
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.server && this.connected) {
      try {
        await this.server.disconnect();
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    }
    
    this.cleanup();
  }
  
  private cleanup(): void {
    this.connected = false;
    this.server = null;
    this.dataCharacteristic = null;
    this.controlCharacteristic = null;
    if (this.onConnectionChange) this.onConnectionChange(false);
  }
  
  private handleDisconnection(): void {
    console.log('Device disconnected');
    this.cleanup();
  }
  
  private handleDataReceived(event: Event): void {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (value && this.onDataReceived) {
      this.onDataReceived(value);
    }
  }
  
  // Send command to the pen
  async sendCommand(command: Uint8Array): Promise<boolean> {
    if (!this.connected || !this.controlCharacteristic) {
      return false;
    }
    
    try {
      await this.controlCharacteristic.writeValue(command);
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }
  
  // Get device information
  getDeviceInfo(): { name: string; id: string } | null {
    if (!this.device) return null;
    
    return {
      name: this.device.name || 'Unknown Pen',
      id: this.device.id
    };
  }
}

export default new BluetoothService();
