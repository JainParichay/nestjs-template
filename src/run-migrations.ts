import { execSync } from 'child_process';

export const runMigrations = () => {
  console.log('Running database migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

export const formatCode = () => {
  console.log('Running database migrations...');
  try {
    execSync('npm run format', { stdio: 'inherit' });
    console.log('Code formatted successfully.');
  } catch (error) {
    console.error('Code formatting failed:', error);
    process.exit(1);
  }
};