
// Define global interfaces for PWA and analytics features

// PWA BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns a Promise that resolves to a DOMString 
   * containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at 
   * a time of their own choosing.
   */
  prompt(): Promise<void>;
}

// Performance Observer
interface PerformanceObserverInit {
  entryTypes: string[];
  buffered?: boolean;
}

interface PerformanceEntry {
  readonly duration: number;
  readonly entryType: string;
  readonly initiatorType?: string;
  readonly name: string;
  readonly startTime: number;
  toJSON(): any;
}

interface PerformanceObserverEntryList {
  getEntries(): PerformanceEntry[];
  getEntriesByName(name: string, type?: string): PerformanceEntry[];
  getEntriesByType(type: string): PerformanceEntry[];
}

type PerformanceObserverCallback = (entries: PerformanceObserverEntryList, observer: PerformanceObserver) => void;

interface PerformanceObserver {
  disconnect(): void;
  observe(options: PerformanceObserverInit): void;
  takeRecords(): PerformanceEntry[];
}

interface PerformanceObserverConstructor {
  new (callback: PerformanceObserverCallback): PerformanceObserver;
  supportedEntryTypes: string[];
}

// Add to Window interface
interface Window {
  PerformanceObserver?: PerformanceObserverConstructor;
  gtag?: (...args: any[]) => void;
  dataLayer?: any[];
}
