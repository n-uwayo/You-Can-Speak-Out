import dotenv from 'dotenv';
import App from './app';
import { prisma } from './app';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

// Initialize app
const app = new App();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT);