
import { useEffect } from 'react';
import analyticsService from '@/services/AnalyticsService';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Track page load performance
    if (window.performance) {
      window.addEventListener('load', () => {
        // Use Navigation Timing API
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigationTiming) {
          // Calculate load time metrics using modern properties
          // startTime is the equivalent of navigationStart in the modern API
          const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
          const domReadyTime = navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime;
          const backendTime = navigationTiming.responseEnd - navigationTiming.requestStart;
          const frontendTime = navigationTiming.loadEventEnd - navigationTiming.responseEnd;
          
          // Track these metrics
          analyticsService.trackPerformance('page_load_time', pageLoadTime);
          analyticsService.trackPerformance('dom_ready_time', domReadyTime);
          analyticsService.trackPerformance('backend_time', backendTime);
          analyticsService.trackPerformance('frontend_time', frontendTime);
        }
      });
    }
    
    // Track resource performance
    if ('PerformanceObserver' in window) {
      try {
        // Track long tasks that might cause janks
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            // Only track long tasks over 100ms
            if (entry.duration > 100) {
              analyticsService.trackPerformance('long_task', entry.duration, {
                task_name: entry.name,
                entry_type: entry.entryType,
              });
            }
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        
        // Track resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            // Filter out analytics calls to avoid infinite loops
            if (entry.name.includes('analytics') || 
                entry.name.includes('gtag') || 
                entry.name.includes('ga')) {
              return;
            }
            
            if (entry.duration > 1000) { // Only track slow resources
              analyticsService.trackPerformance('slow_resource', entry.duration, {
                resource_name: entry.name,
                resource_type: entry.initiatorType,
              });
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        
        // Cleanup on unmount
        return () => {
          longTaskObserver.disconnect();
          resourceObserver.disconnect();
        };
      } catch (error) {
        console.error('Error setting up performance observers:', error);
      }
    }
  }, []);
  
  return null; // This is a utility component with no UI
};

export default PerformanceMonitor;
