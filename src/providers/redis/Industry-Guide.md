1. **Caching Layer**

   - **Problem Solved**: Slow database queries and high database load
   - **Implementation**: Using `set`/`get` with TTL

   ```typescript
   // Example: Caching user profile
   await redis.set(`user:${userId}`, JSON.stringify(userProfile), 3600); // Cache for 1 hour
   const cachedProfile = await redis.getJson(`user:${userId}`);
   ```

2. **Rate Limiting**

   - **Problem Solved**: API abuse and DDoS attacks
   - **Implementation**: Using `incr` with TTL

   ```typescript
   // Example: Rate limiting API calls
   const key = `ratelimit:${userId}:${endpoint}`;
   const count = await redis.incr(key);
   if (count === 1) await redis.expire(key, 60); // Set 1-minute window
   if (count > 100) throw new Error('Rate limit exceeded');
   ```

3. **Session Management**

   - **Problem Solved**: Stateless authentication and session tracking
   - **Implementation**: Using `set` with TTL

   ```typescript
   // Example: Storing user session
   await redis.set(
     `session:${sessionId}`,
     JSON.stringify({
       userId,
       permissions,
       lastActive: Date.now(),
     }),
     86400,
   ); // 24 hours
   ```

4. **Real-time Analytics**

   - **Problem Solved**: Tracking user behavior and metrics
   - **Implementation**: Using `incr` and `hincrby`

   ```typescript
   // Example: Page view counter
   await redis.incr(`pageviews:${pageId}`);
   await redis.hincrby(`user:${userId}:stats`, 'clicks', 1);
   ```

5. **Job Queues**

   - **Problem Solved**: Asynchronous task processing
   - **Implementation**: Using `lpush` and `brpop`

   ```typescript
   // Example: Adding job to queue
   await redis.lpush(
     'job:queue',
     JSON.stringify({
       type: 'email',
       data: { to: 'user@example.com', subject: 'Welcome' },
     }),
   );
   ```

6. **Leaderboards**

   - **Problem Solved**: Real-time ranking systems
   - **Implementation**: Using sorted sets (`zadd`, `zrange`)

   ```typescript
   // Example: Game leaderboard
   await redis.zadd('leaderboard', score, userId);
   const topPlayers = await redis.zrange('leaderboard', 0, 9); // Top 10
   ```

7. **Distributed Locks**

   - **Problem Solved**: Race conditions in distributed systems
   - **Implementation**: Using `set` with NX option

   ```typescript
   // Example: Distributed lock
   const locked = await redis.set(`lock:${resourceId}`, '1', 'NX', 'EX', 30);
   if (locked) {
     try {
       // Perform critical operation
     } finally {
       await redis.del(`lock:${resourceId}`);
     }
   }
   ```

8. **Real-time Chat**

   - **Problem Solved**: Instant messaging and notifications
   - **Implementation**: Using pub/sub

   ```typescript
   // Example: Chat room
   await redis.subscribe(`chat:${roomId}`, (message) => {
     // Handle incoming message
   });
   await redis.publish(
     `chat:${roomId}`,
     JSON.stringify({
       userId,
       message,
       timestamp: Date.now(),
     }),
   );
   ```

9. **Caching Database Queries**

   - **Problem Solved**: Reducing database load
   - **Implementation**: Using `set`/`get` with query results

   ```typescript
   // Example: Caching query results
   const cacheKey = `query:${queryHash}`;
   let result = await redis.getJson(cacheKey);
   if (!result) {
     result = await database.query(query);
     await redis.setJson(cacheKey, result, 300); // Cache for 5 minutes
   }
   ```

10. **User Activity Tracking**

    - **Problem Solved**: Monitoring user engagement
    - **Implementation**: Using sets and sorted sets

    ```typescript
    // Example: Tracking user activity
    await redis.sadd(`user:${userId}:visited_pages`, pageId);
    await redis.zadd(`user:${userId}:activity`, Date.now(), activityId);
    ```

11. **API Response Caching**

    - **Problem Solved**: Reducing API latency
    - **Implementation**: Using `set`/`get` with API responses

    ```typescript
    // Example: Caching API response
    const cacheKey = `api:${endpoint}:${paramsHash}`;
    let response = await redis.getJson(cacheKey);
    if (!response) {
      response = await apiCall();
      await redis.setJson(cacheKey, response, 60); // Cache for 1 minute
    }
    ```

12. **Real-time Counters**

    - **Problem Solved**: Tracking metrics in real-time
    - **Implementation**: Using `incr`/`decr`

    ```typescript
    // Example: Online users counter
    await redis.incr('online_users');
    // When user disconnects
    await redis.decr('online_users');
    ```

13. **Set Operations for Unique Collections**

    - **Problem Solved**: Managing unique collections and relationships
    - **Implementation**: Using `sadd`, `srem`, `smembers`

    ```typescript
    // Example: Managing user roles
    // Add user to admin role
    await redis.sadd('role:admin', userId);

    // Remove user from admin role
    await redis.srem('role:admin', userId);

    // Get all admin users
    const adminUsers = await redis.smembers('role:admin');

    // Example: Tracking unique visitors
    await redis.sadd(`page:${pageId}:visitors`, visitorId);
    const uniqueVisitors = await redis.smembers(`page:${pageId}:visitors`);
    ```

14. **Pipeline Operations for Bulk Processing**

    - **Problem Solved**: Performance optimization for multiple operations
    - **Implementation**: Using `pipeline`

    ```typescript
    // Example: Bulk user data update
    await redis.pipeline([
      async () => redis.set(`user:${userId}:name`, userName),
      async () => redis.set(`user:${userId}:email`, userEmail),
      async () => redis.sadd(`user:${userId}:roles`, 'user'),
      async () => redis.expire(`user:${userId}:name`, 3600),
    ]);

    // Example: Batch cache invalidation
    await redis.pipeline(keys.map((key) => async () => redis.del(key)));
    ```

15. **Scan Operations for Large Datasets**

    - **Problem Solved**: Efficiently processing large datasets without blocking
    - **Implementation**: Using `scan`

    ```typescript
    // Example: Finding all keys matching a pattern
    let cursor = '0';
    const pattern = 'user:*';
    const keys = [];

    do {
      [cursor, const foundKeys] = await redis.scan(cursor, pattern);
      keys.push(...foundKeys);
    } while (cursor !== '0');

    // Example: Batch processing of large datasets
    let cursor = '0';
    const batchSize = 100;

    do {
      [cursor, const foundKeys] = await redis.scan(cursor, 'user:*', batchSize);
      // Process batch of keys
      await processKeys(foundKeys);
    } while (cursor !== '0');
    ```

These use cases demonstrate Redis's versatility in solving common problems in modern applications:

- Performance optimization
- Scalability
- Real-time features
- Data consistency
- Distributed system coordination
- Analytics and monitoring

The key benefits of using Redis for these use cases are:

1. **Speed**: In-memory operations are extremely fast
2. **Simplicity**: Easy to implement and maintain
3. **Reliability**: Built-in persistence and replication
4. **Scalability**: Can be clustered for high availability
5. **Versatility**: Supports multiple data structures
6. **Atomicity**: Operations are atomic, preventing race conditions

Would you like me to elaborate on any of these use cases or provide more specific implementation details?
