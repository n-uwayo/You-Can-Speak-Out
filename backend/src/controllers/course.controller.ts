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

interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnail?: string;
  price?: number;
  isPublished?: boolean;
}

interface UpdateCourseRequest {
  title?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  isPublished?: boolean;
}

interface EnrollStudentRequest {
  studentId: string;
}

interface CourseProgressRequest {
  progress: number; // 0-100
}

// Create a new course
export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      thumbnail,
      price = 0,
      isPublished = false
    }: CreateCourseRequest = req.body;

    const instructorId = req.user?.id;

    // Validate required fields
    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
      return;
    }

    if (!instructorId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Check if user is instructor or admin
    if (req.user?.role !== 'INSTRUCTOR' && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only instructors can create courses'
      });
      return;
    }

    // Validate price
    if (price < 0) {
      res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
      return;
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail: thumbnail || null,
        price,
        isPublished,
        instructorId
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all courses with filters and pagination
export const getAllCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      instructorId,
      isPublished,
      minPrice,
      maxPrice,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Add instructor filter
    if (instructorId) {
      whereClause.instructorId = instructorId as string;
    }

    // Add published filter
    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished === 'true';
    }

    // Add price filters
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice as string);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice as string);
    }

    // Sort configuration
    const validSortFields = ['title', 'price', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { [sortField]: sortDirection },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            },
          },
          _count: {
            select: {
              modules: true,
              enrollments: true
            }
          }
        }
      }),
      prisma.course.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single course by ID
export const getCourseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        modules: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            videos: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                order: true
              }
            },
            tasks: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                title: true,
                dueDate: true,
                points: true,
                taskType: true
              }
            },
            _count: {
              select: {
                videos: { where: { isPublished: true } },
                tasks: { where: { status: 'ACTIVE' } }
              }
            }
          }
        },
        enrollments: userId ? {
          where: { studentId: userId },
          select: {
            id: true,
            enrolledAt: true,
            status: true,
            progress: true,
            completedAt: true
          }
        } : false,
        _count: {
          select: {
            enrollments: true,
            modules: { where: { isPublished: true } }
          }
        }
      }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Calculate total course duration
    const totalDuration = course.modules.reduce((total, module) => {
      return total + module.videos.reduce((moduleTotal, video) => {
        const [minutes, seconds] = video.duration.split(':').map(Number);
        return moduleTotal + (minutes * 60) + (seconds || 0);
      }, 0);
    }, 0);

    const formatDuration = (totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };

    res.json({
      success: true,
      data: {
        ...course,
        totalDuration: formatDuration(totalDuration),
        totalDurationSeconds: totalDuration,
        isEnrolled: course.enrollments && course.enrollments.length > 0,
        enrollmentInfo: course.enrollments?.[0] || null
      }
    });

  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update course
export const updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      thumbnail,
      price,
      isPublished
    }: UpdateCourseRequest = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check if user is the instructor or admin
    if (existingCourse.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can update this course'
      });
      return;
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
      return;
    }

    // Prepare update data
    const updateData: Partial<UpdateCourseRequest> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (price !== undefined) updateData.price = price;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete course
export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!existingCourse) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check if user is the instructor or admin
    if (existingCourse.instructorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can delete this course'
      });
      return;
    }

    // Check if course has enrollments
    if (existingCourse._count.enrollments > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments'
      });
      return;
    }

    // Delete course (cascade will handle related records)
    await prisma.course.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Enroll student in course
export const enrollStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // courseId
    const { studentId }: EnrollStudentRequest = req.body;
    const currentUserId = req.user?.id;

    // If no studentId provided, enroll current user
    const targetStudentId = studentId || currentUserId;

    if (!targetStudentId) {
      res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
      return;
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    if (!course.isPublished) {
      res.status(400).json({
        success: false,
        message: 'Cannot enroll in unpublished course'
      });
      return;
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: targetStudentId }
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: targetStudentId,
          courseId: id
        }
      }
    });

    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
      return;
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: targetStudentId,
        courseId: id
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            instructor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment
    });

  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Unenroll student from course
export const unenrollStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // courseId
    const { studentId } = req.body;
    const currentUserId = req.user?.id;

    // If no studentId provided, unenroll current user
    const targetStudentId = studentId || currentUserId;

    if (!targetStudentId) {
      res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
      return;
    }

    // Find enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: targetStudentId,
          courseId: id
        }
      }
    });

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
      return;
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId: targetStudentId,
          courseId: id
        }
      }
    });

    res.json({
      success: true,
      message: 'Student unenrolled successfully'
    });

  } catch (error) {
    console.error('Unenroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get course enrollments
export const getCourseEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // courseId
    const { page = '1', limit = '10', status } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
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
        message: 'Only the course instructor or admin can view enrollments'
      });
      return;
    }

    const whereClause: any = { courseId: id };
    if (status) {
      whereClause.status = status as string;
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      prisma.enrollment.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get courses by instructor
export const getCoursesByInstructor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { instructorId } = req.params;
    const { page = '1', limit = '10', isPublished } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { instructorId };
    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished === 'true';
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              modules: true,
              enrollments: true
            }
          }
        }
      }),
      prisma.course.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get courses by instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get student's enrolled courses
export const getStudentCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { page = '1', limit = '10', status } = req.query;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { studentId };
    if (status) {
      whereClause.status = status as string;
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { enrolledAt: 'desc' },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              },
              _count: {
                select: {
                  modules: { where: { isPublished: true } }
                }
              }
            }
          }
        }
      }),
      prisma.enrollment.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update course progress
export const updateCourseProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // courseId
    const { progress }: CourseProgressRequest = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Validate progress
    if (progress === undefined || progress < 0 || progress > 100) {
      res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
      return;
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: id
        }
      }
    });

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
      return;
    }

    // Update progress
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId,
          courseId: id
        }
      },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
        status: progress === 100 ? 'COMPLETED' : 'ACTIVE'
      }
    });

    res.json({
      success: true,
      message: 'Course progress updated successfully',
      data: updatedEnrollment
    });

  } catch (error) {
    console.error('Update course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk publish/unpublish courses
export const bulkUpdateCourseStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseIds, isPublished }: { courseIds: string[]; isPublished: boolean } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'courseIds must be a non-empty array'
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

    // For non-admin users, only allow updating their own courses
    let whereClause: any = { id: { in: courseIds } };
    if (req.user?.role !== 'ADMIN') {
      whereClause.instructorId = req.user?.id;
    }

    const updatedCourses = await prisma.course.updateMany({
      where: whereClause,
      data: {
        isPublished
      }
    });

    res.json({
      success: true,
      message: `${updatedCourses.count} courses updated successfully`,
      data: { updatedCount: updatedCourses.count }
    });

  } catch (error) {
    console.error('Bulk update course status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};