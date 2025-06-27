export interface QueueJob<T = any> {
  name: string;
  data: T;
}

export interface QueueJobOptions {
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  delay?: number;
  priority?: 1 | 2 | 3 | 4 | 5; // 1 is highest priority
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  timeout?: number;
  limiter?: {
    max: number; // Max jobs per duration
    duration: number; // Duration in milliseconds
  };
  retryOnError?: boolean;
  retryOnTimeout?: boolean;
  maxRetriesPerSecond?: number;
  retryDelay?: number;
}

export interface QueueStats {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface JobStatus {
  id: string | number;
  name: string;
  state: string;
  progress: number;
  attemptsMade: number;
  failedReason?: string;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
}

export interface QueueProcessor<T = any, R = any> {
  process(job: T): Promise<R>;
}
