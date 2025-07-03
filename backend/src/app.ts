// app.ts - Simplified version to avoid routing issues
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import { errorHandler, AppError } from './middleware/error.middleware';
import  authRoutes  from './routes/auth.routes';
import videoRoutes from './routes/video.routes';
import taskRoutes from './routes/task.routes';
import  courseRoutes  from './routes/course.routes';
import moduleRoutes from './routes/module.routes';
// import { userRoutes } from './routes/user.routes';
import { swaggerSpec } from './config/swagger';

// Initialize Prisma Client
export const prisma = new PrismaClient();

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
   
    // CORS configuration
    this.app.use(cors());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'E-Learning API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API Documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Test endpoint
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      });
    });

    // API Routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/videos', videoRoutes);
    this.app.use('/api/tasks', taskRoutes);
    this.app.use('/api/courses', courseRoutes);
    this.app.use('/api/modules', moduleRoutes);

    
    // 404 handler - must be after all other routes
    this.app.use((req, res, next) => {
      const error = new AppError(`Route ${req.originalUrl} not found`, 404);
      next(error);
    });
  }

  private initializeErrorHandling(): void {
    // Global error handling middleware (must be last)
    this.app.use(errorHandler);
  }

  public listen(port: number): void {
    const server = this.app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💚 Health check: http://localhost:${port}/api/health`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed.');
        
        try {
          await prisma.$disconnect();
          console.log('Database connection closed.');
        } catch (error) {
          console.error('Error closing database connection:', error);
        }
        
        process.exit(0);
      });

      // Force close server after 30 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error('Error:', error.name, error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      console.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
      console.error('Reason:', reason);
      process.exit(1);
    });
  }
}

export default App;