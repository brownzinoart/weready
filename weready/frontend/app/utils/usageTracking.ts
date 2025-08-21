/**
 * Usage Tracking for Free Reports
 * Tracks report usage without requiring user signup
 */

export interface UsageStats {
  reportsUsed: number;
  reportsRemaining: number;
  currentMonth: string;
  hasReachedLimit: boolean;
  canUseFreeTrial: boolean;
}

export class UsageTracker {
  private static STORAGE_KEY = 'weready_usage_tracking';
  private static MAX_FREE_REPORTS = 1;

  /**
   * Get current month in YYYY-MM format
   */
  private static getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Get current usage stats
   */
  static getUsageStats(): UsageStats {
    const currentMonth = this.getCurrentMonth();
    
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return {
        reportsUsed: 0,
        reportsRemaining: this.MAX_FREE_REPORTS,
        currentMonth,
        hasReachedLimit: false,
        canUseFreeTrial: true
      };
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    let data = {
      reportsUsed: 0,
      currentMonth,
      trialUsed: false
    };

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Reset if it's a new month
        if (parsed.currentMonth !== currentMonth) {
          data = {
            reportsUsed: 0,
            currentMonth,
            trialUsed: parsed.trialUsed || false // Preserve trial usage across months
          };
          this.saveUsageData(data);
        } else {
          data = parsed;
        }
      } catch (error) {
        console.error('Error parsing usage data:', error);
        this.saveUsageData(data);
      }
    } else {
      this.saveUsageData(data);
    }

    return {
      reportsUsed: data.reportsUsed,
      reportsRemaining: Math.max(0, this.MAX_FREE_REPORTS - data.reportsUsed),
      currentMonth: data.currentMonth,
      hasReachedLimit: data.reportsUsed >= this.MAX_FREE_REPORTS,
      canUseFreeTrial: !data.trialUsed
    };
  }

  /**
   * Record a new report usage
   */
  static recordReportUsage(): UsageStats {
    const stats = this.getUsageStats();
    
    if (!stats.hasReachedLimit) {
      const newData = {
        reportsUsed: stats.reportsUsed + 1,
        currentMonth: stats.currentMonth,
        trialUsed: this.getStoredTrialUsage()
      };
      
      this.saveUsageData(newData);
      return this.getUsageStats();
    }
    
    return stats;
  }

  /**
   * Check if user can generate a report
   */
  static canGenerateReport(): boolean {
    const stats = this.getUsageStats();
    return !stats.hasReachedLimit;
  }

  /**
   * Mark trial as used
   */
  static markTrialAsUsed(): void {
    const currentData = this.getStoredData();
    currentData.trialUsed = true;
    this.saveUsageData(currentData);
  }

  /**
   * Check if user has used their free trial
   */
  static hasUsedFreeTrial(): boolean {
    return this.getStoredTrialUsage();
  }

  /**
   * Reset usage (for testing/admin purposes)
   */
  static resetUsage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Get stored trial usage status
   */
  private static getStoredTrialUsage(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.trialUsed || false;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Get stored data with defaults
   */
  private static getStoredData() {
    if (typeof window === 'undefined') {
      const currentMonth = this.getCurrentMonth();
      return {
        reportsUsed: 0,
        currentMonth,
        trialUsed: false
      };
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const currentMonth = this.getCurrentMonth();
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Reset if new month but preserve trial status
        if (parsed.currentMonth !== currentMonth) {
          return {
            reportsUsed: 0,
            currentMonth,
            trialUsed: parsed.trialUsed || false
          };
        }
        return parsed;
      } catch {
        return {
          reportsUsed: 0,
          currentMonth,
          trialUsed: false
        };
      }
    }
    
    return {
      reportsUsed: 0,
      currentMonth,
      trialUsed: false
    };
  }

  /**
   * Save usage data to localStorage
   */
  private static saveUsageData(data: any): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  /**
   * Get usage message for UI
   */
  static getUsageMessage(): string {
    const stats = this.getUsageStats();
    
    if (stats.hasReachedLimit) {
      return "You've used your free report. Choose a plan for unlimited access!";
    } else {
      return "Get your free startup analysis report";
    }
  }

  /**
   * Should show upgrade prompt after this usage
   */
  static shouldShowUpgradePrompt(): boolean {
    const stats = this.getUsageStats();
    // Show upgrade prompt immediately after the single free report
    return stats.reportsUsed >= 1;
  }

  /**
   * Should offer pricing tiers (after the single free report)
   */
  static shouldOfferPricingTiers(): boolean {
    const stats = this.getUsageStats();
    return stats.reportsUsed >= 1;
  }
}

export default UsageTracker;