
// Enumeration of event categories for consistent tracking
export enum EventCategory {
  PAGE_VIEW = 'page_view',
  FEATURE_USAGE = 'feature_usage',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  USER_ENGAGEMENT = 'user_engagement',
}

// Types of feature actions
export enum FeatureAction {
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  SCAN = 'scan',
  OCR = 'ocr',
  STUDY_MODE = 'study_mode',
}

// Interface for event parameters
interface EventParams {
  event_category: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

class AnalyticsService {
  private isInitialized = false;

  constructor() {
    this.setupDataLayer();
  }

  private setupDataLayer(): void {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      this.isInitialized = true;
    }
  }

  /**
   * Track a page view event
   * @param pagePath The path of the page (e.g., /notes, /note/123)
   * @param pageTitle The title of the page
   */
  trackPageView(pagePath: string, pageTitle: string): void {
    if (!this.isInitialized) return;

    this.trackEvent('page_view', {
      event_category: EventCategory.PAGE_VIEW,
      event_label: pagePath,
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  /**
   * Track a feature usage event
   * @param featureName The name of the feature being used
   * @param action The action performed on the feature
   * @param additionalParams Any additional parameters to track
   */
  trackFeatureUsage(
    featureName: string, 
    action: FeatureAction, 
    additionalParams: Record<string, any> = {}
  ): void {
    if (!this.isInitialized) return;

    this.trackEvent('feature_usage', {
      event_category: EventCategory.FEATURE_USAGE,
      event_label: `${featureName}_${action}`,
      feature: featureName,
      action: action,
      ...additionalParams,
    });
  }

  /**
   * Track an error event
   * @param errorMessage The error message
   * @param errorSource The source of the error (e.g., API, UI, etc.)
   * @param additionalParams Any additional parameters to track
   */
  trackError(
    errorMessage: string, 
    errorSource: string, 
    additionalParams: Record<string, any> = {}
  ): void {
    if (!this.isInitialized) return;

    this.trackEvent('exception', {
      event_category: EventCategory.ERROR,
      event_label: errorMessage,
      error_source: errorSource,
      description: errorMessage,
      fatal: false,
      ...additionalParams,
    });
  }

  /**
   * Track a performance metric
   * @param metricName The name of the metric being tracked
   * @param value The value of the metric
   * @param additionalParams Any additional parameters to track
   */
  trackPerformance(
    metricName: string, 
    value: number, 
    additionalParams: Record<string, any> = {}
  ): void {
    if (!this.isInitialized) return;

    this.trackEvent('timing_complete', {
      event_category: EventCategory.PERFORMANCE,
      event_label: metricName,
      name: metricName,
      value: value,
      ...additionalParams,
    });
  }

  /**
   * Generic method to track any event
   * @param eventName The name of the event
   * @param params The parameters to include with the event
   */
  trackEvent(eventName: string, params: EventParams): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', eventName, params);
    } else {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }

    // Log analytics in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, params);
    }
  }

  /**
   * Set user properties for analytics
   * @param userId The user ID
   * @param properties User properties to set
   */
  setUserProperties(userId: string, properties: Record<string, any> = {}): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('set', 'user_properties', {
        user_id: userId,
        ...properties,
      });
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
