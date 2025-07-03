// routes/task.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  submitTaskSchema, 
  gradeSubmissionSchema,
  queryTaskSchema 
} from '../schemas/task.schemas';
import { TaskService } from '../services/task.service';
const router = Router();
const prisma = new PrismaClient();
const taskService = new TaskService(prisma);
/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         instructions:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         points:
 *           type: number
 *         taskType:
 *           type: string
 *           enum: [TEXT, FILE, BOTH]
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ARCHIVED]
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks with filtering and pagination
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: Filter by module ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ARCHIVED]
 *         description: Filter by task status
 *       - in: query
 *         name: taskType
 *         schema:
 *           type: string
 *           enum: [TEXT, FILE, BOTH]
 *         description: Filter by task type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const {
        moduleId,
        courseId,
        status,
        taskType,
        page = 1,
        limit = 10,
        sortBy = 'dueDate',
        sortOrder = 'asc',
        search
      } = req.query;

      const filters = {
        moduleId: moduleId as string,
        courseId: courseId as string,
        status: status as string,
        taskType: taskType as string,
        search: search as string
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await taskService.getTasks(userId, userRole, filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const task = await taskService.getTaskById(id, userId, userRole);
      
      if (!task) {
        throw new AppError('Task not found', 404);
      }

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - moduleId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               instructions:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               points:
 *                 type: number
 *               taskType:
 *                 type: string
 *                 enum: [TEXT, FILE, BOTH]
 *               moduleId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/',
  authenticate,
  authorize(['INSTRUCTOR', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const taskData = req.body;

      const task = await taskService.createTask(userId, userRole, taskData);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               instructions:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               points:
 *                 type: number
 *               taskType:
 *                 type: string
 *                 enum: [TEXT, FILE, BOTH]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, ARCHIVED]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id',
  authenticate,
  authorize(['INSTRUCTOR', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const updateData = req.body;

      const task = await taskService.updateTask(id, userId, userRole, updateData);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id',
  authenticate,
  authorize(['INSTRUCTOR', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      await taskService.deleteTask(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ================== SUBMISSION ROUTES ==================

/**
 * @swagger
 * /api/tasks/{taskId}/submit:
 *   post:
 *     summary: Submit a task
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               textSubmission:
 *                 type: string
 *               comment:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Task submitted successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/:taskId/submit',
  authenticate,
  authorize(['STUDENT']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const studentId = req.user!.id;
      const { textSubmission, comment } = req.body;
      const files = req.files as Express.Multer.File[];

      res.status(201).json({
        success: true,
        message: 'Task submitted successfully',
        data: []
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{taskId}/submissions:
 *   get:
 *     summary: Get submissions for a task
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUBMITTED, GRADED, RETURNED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of submissions
 *       403:
 *         description: Forbidden
 */
router.get('/:taskId/submissions',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { status, page = 1, limit = 10 } = req.query;

      const filters = {
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      res.status(200).json({
        success: true,
        data: '',
        pagination: ''
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/submissions/{submissionId}/grade:
 *   put:
 *     summary: Grade a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *             properties:
 *               grade:
 *                 type: number
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       404:
 *         description: Submission not found
 *       403:
 *         description: Forbidden
 */
router.put('/submissions/:submissionId/grade',
  authenticate,
  authorize(['INSTRUCTOR', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { submissionId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { grade, feedback } = req.body;


      res.status(200).json({
        success: true,
        message: 'Submission graded successfully',
        data: []
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{taskId}/stats:
 *   get:
 *     summary: Get submission statistics for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task statistics
 *       403:
 *         description: Forbidden
 */
router.get('/:taskId/stats',
  authenticate,
  authorize(['INSTRUCTOR', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const stats = await taskService.getTaskStats(taskId, userId, userRole);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/submissions/{submissionId}:
 *   get:
 *     summary: Get a single submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission details
 *       404:
 *         description: Submission not found
 *       403:
 *         description: Forbidden
 */
router.get('/submissions/:submissionId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { submissionId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;


      res.status(200).json({
        success: true,
        data: []
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;