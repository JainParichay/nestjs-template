# Prisma Industry Guide

This guide covers common use cases and best practices for using Prisma in production environments.

1. **Database Migrations**

   - **Problem Solved**: Safe and version-controlled database schema changes
   - **Implementation**: Using Prisma Migrate

   ```typescript
   // Example: Creating and applying migrations
   // Command line:
   // npx prisma migrate dev --name add_user_fields

   // Example schema change
   model User {
     id        Int      @id @default(autoincrement())
     email     String   @unique
     name      String?
     role      Role     @default(USER)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Type-Safe Queries**

   - **Problem Solved**: Runtime type errors and SQL injection
   - **Implementation**: Using Prisma Client

   ```typescript
   // Example: Type-safe queries
   const user = await prisma.user.findUnique({
     where: { email: 'user@example.com' },
     include: { posts: true },
   });

   // Example: Complex queries
   const activeUsers = await prisma.user.findMany({
     where: {
       AND: [{ role: 'ADMIN' }, { posts: { some: { published: true } } }],
     },
     include: {
       profile: true,
       posts: {
         where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
       },
     },
   });
   ```

3. **Transaction Management**

   - **Problem Solved**: Data consistency across multiple operations
   - **Implementation**: Using `$transaction`

   ```typescript
   // Example: Atomic operations
   const result = await prisma.$transaction(async (tx) => {
     const user = await tx.user.create({
       data: { email: 'user@example.com' },
     });

     await tx.profile.create({
       data: {
         userId: user.id,
         bio: 'New user',
       },
     });

     return user;
   });
   ```

4. **Soft Deletes**

   - **Problem Solved**: Data recovery and audit trails
   - **Implementation**: Using deletedAt field

   ```typescript
   // Example: Soft delete implementation
   model User {
     id        Int       @id @default(autoincrement())
     email     String    @unique
     deletedAt DateTime?
   }

   // Soft delete query
   await prisma.user.update({
     where: { id: userId },
     data: { deletedAt: new Date() }
   });

   // Query excluding soft deleted
   const activeUsers = await prisma.user.findMany({
     where: { deletedAt: null }
   });
   ```

5. **Pagination**

   - **Problem Solved**: Efficient data retrieval for large datasets
   - **Implementation**: Using `skip` and `take`

   ```typescript
   // Example: Offset pagination
   const users = await prisma.user.findMany({
     skip: (page - 1) * pageSize,
     take: pageSize,
     orderBy: { createdAt: 'desc' },
   });

   // Example: Cursor pagination
   const users = await prisma.user.findMany({
     take: pageSize,
     cursor: { id: lastId },
     orderBy: { id: 'asc' },
   });
   ```

6. **Data Validation**

   - **Problem Solved**: Data integrity and validation
   - **Implementation**: Using Prisma schema and middleware

   ```typescript
   // Example: Schema-level validation
   model User {
     id        Int      @id @default(autoincrement())
     email     String   @unique @db.VarChar(255)
     age       Int      @db.SmallInt
     role      Role     @default(USER)
   }

   // Example: Middleware validation
   prisma.$use(async (params, next) => {
     if (params.model === 'User' && params.action === 'create') {
       // Validate email format
       if (!isValidEmail(params.args.data.email)) {
         throw new Error('Invalid email format');
       }
     }
     return next(params);
   });
   ```

7. **Relationships and Joins**

   - **Problem Solved**: Complex data relationships
   - **Implementation**: Using Prisma relations

   ```typescript
   // Example: Complex relationships
   const userWithPosts = await prisma.user.findUnique({
     where: { id: userId },
     include: {
       posts: {
         where: { published: true },
         include: {
           categories: true,
           author: {
             select: { name: true, email: true },
           },
         },
       },
       profile: true,
     },
   });
   ```

8. **Batch Operations**

   - **Problem Solved**: Efficient bulk data operations
   - **Implementation**: Using `createMany`, `updateMany`, `deleteMany`

   ```typescript
   // Example: Batch create
   await prisma.user.createMany({
     data: users.map((user) => ({
       email: user.email,
       name: user.name,
     })),
     skipDuplicates: true,
   });

   // Example: Batch update
   await prisma.post.updateMany({
     where: { published: false },
     data: { status: 'DRAFT' },
   });
   ```

9. **Query Optimization**

   - **Problem Solved**: Performance and resource usage
   - **Implementation**: Using select and include

   ```typescript
   // Example: Optimized query
   const users = await prisma.user.findMany({
     select: {
       id: true,
       email: true,
       posts: {
         select: {
           id: true,
           title: true,
         },
       },
     },
   });
   ```

10. **Error Handling**

    - **Problem Solved**: Graceful error management
    - **Implementation**: Using try-catch and Prisma error types

    ```typescript
    try {
      const user = await prisma.user.create({
        data: { email: 'user@example.com' },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Handle unique constraint violation
          console.error('Email already exists');
        }
      }
      throw error;
    }
    ```

11. **Middleware and Hooks**

    - **Problem Solved**: Cross-cutting concerns
    - **Implementation**: Using Prisma middleware

    ```typescript
    // Example: Logging middleware
    prisma.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      console.log(
        `Query ${params.model}.${params.action} took ${after - before}ms`,
      );
      return result;
    });
    ```

12. **Data Seeding**
    - **Problem Solved**: Initial data population
    - **Implementation**: Using Prisma seed
    ```typescript
    // Example: Seed script
    async function main() {
      await prisma.user.createMany({
        data: [
          { email: 'admin@example.com', role: 'ADMIN' },
          { email: 'user@example.com', role: 'USER' },
        ],
      });
    }
    ```

These use cases demonstrate Prisma's capabilities in solving common problems in modern applications:

- Type safety
- Data consistency
- Performance optimization
- Developer productivity
- Database abstraction
- Schema management

The key benefits of using Prisma for these use cases are:

1. **Type Safety**: Full TypeScript support
2. **Productivity**: Auto-completion and type inference
3. **Performance**: Optimized queries and connection pooling
4. **Maintainability**: Schema version control
5. **Security**: SQL injection prevention
6. **Flexibility**: Support for multiple databases

Would you like me to elaborate on any of these use cases or provide more specific implementation details?
