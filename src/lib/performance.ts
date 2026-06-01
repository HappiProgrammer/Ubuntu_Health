/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map()
  private static marks: Map<string, number> = new Map()

  /**
   * Start timing an operation
   */
  static startMark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * End timing and store the result
   */
  static endMark(name: string): number {
    const start = this.marks.get(name)
    if (!start) {
      console.warn(`No start mark found for: ${name}`)
      return 0
    }

    const duration = performance.now() - start
    this.metrics.set(name, duration)
    this.marks.delete(name)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Get a specific metric
   */
  static getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  /**
   * Get all metrics
   */
  static getAllMetrics(): Map<string, number> {
    return this.metrics
  }

  /**
   * Log performance report
   */
  static report(): void {
    console.group('📊 Performance Report')
    this.metrics.forEach((duration, name) => {
      const status = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢'
      console.log(`${status} ${name}: ${duration.toFixed(2)}ms`)
    })
    console.groupEnd()
  }

  /**
   * Clear all metrics
   */
  static clear(): void {
    this.metrics.clear()
    this.marks.clear()
  }

  /**
   * Measure Core Web Vitals
   */
  static measureWebVitals(): void {
    // First Contentful Paint
    const paintObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        console.log(`🎨 ${entry.name}: ${(entry.startTime / 1000).toFixed(2)}s`)
      })
    })

    try {
      paintObserver.observe({ type: 'paint', buffered: true })
    } catch (e) {
      console.warn('Performance Observer not supported')
    }
  }
}

// React hook for component timing
export function usePerformanceMonitor(componentName: string) {
  return {
    start: () => PerformanceMonitor.startMark(componentName),
    end: () => PerformanceMonitor.endMark(componentName),
  }
}
