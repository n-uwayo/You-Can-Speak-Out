import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaces
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface CreateModuleRequest {
  title: string;
  description: string;
  order?: number;
  isPublished?: boolean;
}

interface UpdateModuleRequest {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

interface ReorderModulesRequest {
  moduleOrders: {
    moduleId: string;
    order: number;
  }[];
}

// Create a new module
export const createModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      order,
      isPublished = false
    }: CreateModuleRequest = req.body;

    // Validate required fields
    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
      return;
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check if user is the instructor or admin
    if (course.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can create modules'
      });
      return;
    }

    // Determine order if not provided
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' }
      });
      moduleOrder = lastModule ? lastModule.order + 1 : 1;
    }

    // Check if order already exists and adjust if necessary
    const existingModule = await prisma.module.findFirst({
      where: { courseId, order: moduleOrder }
    });

    if (existingModule) {
      // Shift all modules with order >= moduleOrder by 1
      await prisma.module.updateMany({
        where: {
          courseId,
          order: { gte: moduleOrder }
        },
        data: {
          order: { increment: 1 }
        }
      });
    }

    // Create module
    const module = await prisma.module.create({
      data: {
        title,
        description,
        order: moduleOrder,
        isPublished,
        courseId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            videos: true,
            tasks: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
    });

  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all modules for a course
export const getCourseModules = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { includeUnpublished = 'false' } = req.query;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Determine if user can see unpublished content
    const canSeeUnpublished = 
      req.user?.role === 'ADMIN' || 
      course.instructorId === req.user?.id ||
      includeUnpublished === 'true';

    const whereClause: any = { courseId };
    if (!canSeeUnpublished) {
      whereClause.isPublished = true;
    }

    const modules = await prisma.module.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
      include: {
        videos: {
          where: canSeeUnpublished ? {} : { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
            isPublished: true
          }
        },
        tasks: {
          where: canSeeUnpublished ? {} : { status: 'ACTIVE' },
          select: {
            id: true,
            title: true,
            dueDate: true,
            points: true,
            taskType: true,
            status: true
          }
        },
        _count: {
          select: {
            videos: canSeeUnpublished ? true : { where: { isPublished: true } },
            tasks: canSeeUnpublished ? true : { where: { status: 'ACTIVE' } }
          }
        }
      }
    });

    res.json({
      success: true,
      data: modules
    });

  } catch (error) {
    console.error('Get course modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single module by ID
export const getModuleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        videos: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                comments: true
              }
            }
          }
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
          include: {
            _count: {
              select: {
                submissions: true
              }
            }
          }
        },
        _count: {
          select: {
            videos: true,
            tasks: true
          }
        }
      }
    });

    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    // Check access permissions
    const canAccess = 
      module.isPublished || 
      req.user?.role === 'ADMIN' || 
      module.course.instructorId === req.user?.id;

    if (!canAccess) {
      res.status(403).json({
        success: false,
        message: 'Access denied to unpublished module'
      });
      return;
    }

    // Filter content based on permissions for non-owners
    if (module.course.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      module.videos = module.videos.filter(video => video.isPublished);
      module.tasks = module.tasks.filter(task => task.status === 'ACTIVE');
    }

    res.json({
      success: true,
      data: module
    });

  } catch (error) {
    console.error('Get module by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update module
export const updateModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      order,
      isPublished
    }: UpdateModuleRequest = req.body;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true
      }
    });

    if (!existingModule) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    // Check permissions
    if (existingModule.course.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can update this module'
      });
      return;
    }

    // Handle order change
    if (order !== undefined && order !== existingModule.order) {
      const courseId = existingModule.courseId;
      
      if (order > existingModule.order) {
        // Moving down: decrease order of modules between old and new position
        await prisma.module.updateMany({
          where: {
            courseId,
            order: {
              gt: existingModule.order,
              lte: order
            }
          },
          data: {
            order: { decrement: 1 }
          }
        });
      } else {
        // Moving up: increase order of modules between new and old position
        await prisma.module.updateMany({
          where: {
            courseId,
            order: {
              gte: order,
              lt: existingModule.order
            }
          },
          data: {
            order: { increment: 1 }
          }
        });
      }
    }

    // Prepare update data
    const updateData: Partial<UpdateModuleRequest> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedModule = await prisma.module.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            videos: true,
            tasks: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: updatedModule
    });

  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete module
export const deleteModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
        _count: {
          select: {
            videos: true,
            tasks: true
          }
        }
      }
    });

    if (!existingModule) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    // Check permissions
    if (existingModule.course.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can delete this module'
      });
      return;
    }

    // Optional: Prevent deletion if module has content
    if (existingModule._count.videos > 0 || existingModule._count.tasks > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete module with existing videos or tasks. Please remove content first.'
      });
      return;
    }

    // Delete module and adjust order of remaining modules
    await prisma.$transaction([
      // Delete the module
      prisma.module.delete({
        where: { id }
      }),
      // Adjust order of remaining modules
      prisma.module.updateMany({
        where: {
          courseId: existingModule.courseId,
          order: { gt: existingModule.order }
        },
        data: {
          order: { decrement: 1 }
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reorder modules
export const reorderModules = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { moduleOrders }: ReorderModulesRequest = req.body;

    if (!Array.isArray(moduleOrders) || moduleOrders.length === 0) {
      res.status(400).json({
        success: false,
        message: 'moduleOrders must be a non-empty array'
      });
      return;
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check permissions
    if (course.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can reorder modules'
      });
      return;
    }

    // Validate that all modules belong to the course
    const moduleIds = moduleOrders.map(mo => mo.moduleId);
    const existingModules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds },
        courseId
      }
    });

    if (existingModules.length !== moduleIds.length) {
      res.status(400).json({
        success: false,
        message: 'Some modules do not belong to this course'
      });
      return;
    }

    // Update module orders in a transaction
    await prisma.$transaction(
      moduleOrders.map(({ moduleId, order }) =>
        prisma.module.update({
          where: { id: moduleId },
          data: { order }
        })
      )
    );

    // Fetch updated modules
    const updatedModules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            videos: true,
            tasks: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Modules reordered successfully',
      data: updatedModules
    });

  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk publish/unpublish modules
export const bulkUpdateModuleStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { moduleIds, isPublished }: { moduleIds: string[]; isPublished: boolean } = req.body;

    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'moduleIds must be a non-empty array'
      });
      return;
    }

    if (typeof isPublished !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isPublished must be a boolean'
      });
      return;
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check permissions
    if (course.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can update module status'
      });
      return;
    }

    const updatedModules = await prisma.module.updateMany({
      where: {
        id: { in: moduleIds },
        courseId
      },
      data: {
        isPublished
      }
    });

    res.json({
      success: true,
      message: `${updatedModules.count} modules updated successfully`,
      data: { updatedCount: updatedModules.count }
    });

  } catch (error) {
    console.error('Bulk update module status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Duplicate module
export const duplicateModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title: newTitle } = req.body;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
        videos: true,
        tasks: true
      }
    });

    if (!existingModule) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    // Check permissions
    if (existingModule.course.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can duplicate this module'
      });
      return;
    }

    // Get next order
    const lastModule = await prisma.module.findFirst({
      where: { courseId: existingModule.courseId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastModule ? lastModule.order + 1 : 1;

    // Create duplicate module
    const duplicatedModule = await prisma.module.create({
      data: {
        title: newTitle || `${existingModule.title} (Copy)`,
        description: existingModule.description,
        order: nextOrder,
        isPublished: false, // Always create as unpublished
        courseId: existingModule.courseId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            videos: true,
            tasks: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Module duplicated successfully',
      data: duplicatedModule
    });

  } catch (error) {
    console.error('Duplicate module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};