// services/task.service.ts
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { PermissionUtils } from '../utils/permissions.utils';
import {
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  PaginationOptions,
  TaskStats,  
} from '../types/task.types';

export class TaskService {
  private permissionUtils: PermissionUtils;

  constructor(private prisma: PrismaClient) {
    this.permissionUtils = new PermissionUtils(prisma);
  }

  async getTasks(
    userId: string,
    userRole: string,
    filters: TaskFilters,
    pagination: PaginationOptions
  ): Promise<{ tasks: any[]; pagination: any }> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filters.moduleId) where.moduleId = filters.moduleId;
    if (filters.status) where.status = filters.status;
    if (filters.taskType) where.taskType = filters.taskType;

    // Search functionality
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Course filter
    if (filters.courseId) {
      where.module = { courseId: filters.courseId };
    }

    // Role-based filtering
    if (userRole === 'STUDENT') {
      where.status = 'ACTIVE';
      where.module = {
        ...where.module,
        isPublished: true,
        course: {
          isPublished: true,
          enrollments: {
            some: {
              studentId: userId,
              status: 'ACTIVE'
            }
          }
        }
      };
    } else if (userRole === 'INSTRUCTOR') {
      where.module = {
        ...where.module,
        course: {
          instructorId: userId
        }
      };
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  instructor: {
                    select: { id: true, name: true }
                  }
                }
              }
            }
          },
          submissions: userRole === 'STUDENT' ? {
            where: { studentId: userId },
            select: {
              id: true,
              status: true,
              grade: true,
              submittedAt: true
            }
          } : {
            select: {
              id: true,
              status: true
            }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTaskById(
    taskId: string,
    userId: string,
    userRole: string
  ): Promise<any> {
    const { hasAccess, task, error } = await this.permissionUtils.checkTaskAccess(
      userId,
      taskId,
      userRole
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    const taskDetails = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        module: {
          include: {
            course: {
              include: {
                instructor: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        submissions: userRole === 'STUDENT' ? {
          where: { studentId: userId }
        } : {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { submissions: true }
        }
      }
    });

    return taskDetails;
  }

  async createTask(
    userId: string,
    userRole: string,
    taskData: CreateTaskData
  ): Promise<any> {
    // Check if user owns the module
    const hasPermission = await this.permissionUtils.checkModuleOwnership(
      userId,
      taskData.moduleId,
      userRole
    );

    if (!hasPermission) {
      throw new AppError('Access denied', 403);
    }

    // Verify module exists
    const module = await this.prisma.module.findUnique({
      where: { id: taskData.moduleId },
      include: { course: true }
    });

    if (!module) {
      throw new AppError('Module not found', 404);
    }

    const task = await this.prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        instructions: taskData.instructions,
        dueDate: taskData.dueDate,
        points: taskData.points || 0,
        taskType: taskData.taskType || 'TEXT',
        moduleId: taskData.moduleId
      },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    return task;
  }

  async updateTask(
    taskId: string,
    userId: string,
    userRole: string,
    updateData: UpdateTaskData
  ): Promise<any> {
    const { hasAccess, task, error } = await this.permissionUtils.checkTaskAccess(
      userId,
      taskId,
      userRole
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    // Check ownership for instructors
    if (userRole === 'INSTRUCTOR' && task.module.course.instructorId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    return updatedTask;
  }

  async deleteTask(
    taskId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const { hasAccess, task, error } = await this.permissionUtils.checkTaskAccess(
      userId,
      taskId,
      userRole
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    // Check ownership for instructors
    if (userRole === 'INSTRUCTOR' && task.module.course.instructorId !== userId) {
      throw new AppError('Access denied', 403);
    }

    await this.prisma.task.delete({
      where: { id: taskId }
    });
  }

  async getTaskStats(
    taskId: string,
    userId: string,
    userRole: string
  ): Promise<TaskStats> {
    const { hasAccess, task, error } = await this.permissionUtils.checkTaskAccess(
      userId,
      taskId,
      userRole
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    // Check ownership for instructors
    if (userRole === 'INSTRUCTOR' && task.module.course.instructorId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const [
      totalEnrolled,
      submissions,
      averageGrade
    ] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          courseId: task.module.courseId,
          status: 'ACTIVE'
        }
      }),
      this.prisma.taskSubmission.findMany({
        where: { taskId },
        select: {
          status: true,
          grade: true,
          submittedAt: true
        }
      }),
      this.prisma.taskSubmission.aggregate({
        where: { taskId, grade: { not: null } },
        _avg: { grade: true }
      })
    ]);

    const submissionStats = submissions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEnrolled,
      totalSubmissions: submissions.length,
      submissionRate: totalEnrolled > 0 ? 
        ((submissions.length / totalEnrolled) * 100).toFixed(2) : '0',
      submissionStats,
      averageGrade: averageGrade._avg.grade || 0,
      gradedCount: submissionStats.GRADED || 0
    };
  }
}
