// schemas/task.schemas.ts
import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  instructions: Joi.string().max(5000).optional(),
  dueDate: Joi.date().greater('now').required(),
  points: Joi.number().min(0).max(1000).default(0),
  taskType: Joi.string().valid('TEXT', 'FILE', 'BOTH').default('TEXT'),
  moduleId: Joi.string().required()
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  instructions: Joi.string().max(5000).optional(),
  dueDate: Joi.date().greater('now').optional(),
  points: Joi.number().min(0).max(1000).optional(),
  taskType: Joi.string().valid('TEXT', 'FILE', 'BOTH').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ARCHIVED').optional()
});

export const submitTaskSchema = Joi.object({
  textSubmission: Joi.string().max(10000).optional(),
  comment: Joi.string().max(1000).optional()
});

export const gradeSubmissionSchema = Joi.object({
  grade: Joi.number().min(0).required(),
  feedback: Joi.string().max(2000).optional()
});

export const queryTaskSchema = Joi.object({
  moduleId: Joi.string().optional(),
  courseId: Joi.string().optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ARCHIVED').optional(),
  taskType: Joi.string().valid('TEXT', 'FILE', 'BOTH').optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string().valid('title', 'dueDate', 'createdAt', 'points').default('dueDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  search: Joi.string().max(100).optional()
});