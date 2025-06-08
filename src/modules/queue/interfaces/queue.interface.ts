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
  priority?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  timeout?: number;
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
