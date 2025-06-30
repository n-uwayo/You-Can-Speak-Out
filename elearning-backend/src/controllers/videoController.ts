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

interface CreateVideoRequest {
  title: string;
  description?: string;
  videoUrl: string;
  duration?: string;
  order: number;
  moduleId: string;
  isPublished?: boolean;
}

interface UpdateVideoRequest {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: string;
  order?: number;
  isPublished?: boolean;
}

interface VideoProgressRequest {
  watchedSeconds: number;
  isCompleted?: boolean;
}

interface VideoOrderRequest {
  id: string;
  order: number;
}

interface ReorderVideosRequest {
  videoOrders: VideoOrderRequest[];
}

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to get YouTube video duration (requires YouTube API)
const getYouTubeDuration = async (videoId: string): Promise<string> => {
  // Note: You'll need to implement YouTube API integration
  // For now, returning a placeholder
  return "0:00";
};

// Helper function to validate YouTube URL
const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?][\w=]*)*$/;
  return youtubeRegex.test(url);
};

// Create a new video
export const createVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

  try {
    
    const {
      title,
      description,
      videoUrl,
      duration,
      order,
      moduleId,
      isPublished = false
    }: CreateVideoRequest = req.body;
    const youtubeId = extractYouTubeId(videoUrl);

    let videoDuration = duration;
if (!videoDuration && youtubeId) {
  videoDuration = await getYouTubeDuration(youtubeId);
}

    // Validate required fields
    if (!title || !videoUrl || !moduleId || order === undefined) {
      res.status(400).json({
        success: false,
        message: 'Title, video URL, module ID, and order are required'
      });
      return;
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(videoUrl)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid YouTube URL'
      });
      return;
    }

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module not found'
      });
      return;
    }

    // Extract YouTube video ID for potential future use
    // const youtubeId = extractYouTubeId(videoUrl);
    
    // Create video
    const video = await prisma.video.create({
      data: {
        title,
        description: description || '',
        videoUrl,
        duration: videoDuration || '0:00',
        order,
        moduleId,
        isPublished
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });

  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all videos for a module
export const getVideosByModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { includeUnpublished = 'false' } = req.query;

    const whereClause: any = { moduleId };
    
    // If not including unpublished, filter them out
    if (includeUnpublished !== 'true') {
      whereClause.isPublished = true;
    }

    const videos = await prisma.video.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true
          }
        },
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Limit to recent comments
        },
        progresses: req.user ? {
          where: { userId: req.user.id },
          select: {
            watchedSeconds: true,
            isCompleted: true,
            lastWatchedAt: true
          }
        } : false
      }
    });

    res.json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('Get videos by module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single video by ID
export const getVideoById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                instructorId: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          },
          where: { parentId: null }, // Only top-level comments
          orderBy: { createdAt: 'desc' }
        },
        progresses: req.user ? {
          where: { userId: req.user.id }
        } : false
      }
    });

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
      return;
    }

    // Extract YouTube video ID for embed URL
    const youtubeId = extractYouTubeId(video.videoUrl);
    const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;

    res.json({
      success: true,
      data: {
        ...video,
        youtubeId,
        embedUrl
      }
    });

  } catch (error) {
    console.error('Get video by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update video
export const updateVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      videoUrl,
      duration,
      order,
      isPublished
    }: UpdateVideoRequest = req.body;

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
      return;
    }

    // Validate YouTube URL if provided
    if (videoUrl && !isValidYouTubeUrl(videoUrl)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid YouTube URL'
      });
      return;
    }

    // Prepare update data
    const updateData: Partial<UpdateVideoRequest> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (duration !== undefined) updateData.duration = duration;
    if (order !== undefined) updateData.order = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: updateData,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedVideo
    });

  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete video
export const deleteVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
      return;
    }

    // Delete video (cascade will handle related records)
    await prisma.video.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update video progress
export const updateVideoProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { watchedSeconds, isCompleted }: VideoProgressRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Validate required fields
    if (watchedSeconds === undefined) {
      res.status(400).json({
        success: false,
        message: 'Watched seconds is required'
      });
      return;
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      });
      return;
    }

    // Upsert video progress
    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId: id
        }
      },
      update: {
        watchedSeconds,
        isCompleted: isCompleted || false,
        lastWatchedAt: new Date()
      },
      create: {
        userId,
        videoId: id,
        watchedSeconds,
        isCompleted: isCompleted || false
      }
    });

    res.json({
      success: true,
      message: 'Video progress updated successfully',
      data: progress
    });

  } catch (error) {
    console.error('Update video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get video progress for user
export const getVideoProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const progress = await prisma.videoProgress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId: id
        }
      }
    });

    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Get video progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reorder videos in a module
export const reorderVideos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { videoOrders }: ReorderVideosRequest = req.body;

    if (!Array.isArray(videoOrders)) {
      res.status(400).json({
        success: false,
        message: 'videoOrders must be an array'
      });
      return;
    }

    // Validate that all items have required properties
    const isValidOrders = videoOrders.every(item => 
      typeof item.id === 'string' && typeof item.order === 'number'
    );

    if (!isValidOrders) {
      res.status(400).json({
        success: false,
        message: 'Each video order must have id (string) and order (number)'
      });
      return;
    }

    // Update all video orders in a transaction
    const updatePromises = videoOrders.map(({ id, order }) =>
      prisma.video.update({
        where: { id },
        data: { order }
      })
    );

    await prisma.$transaction(updatePromises);

    res.json({
      success: true,
      message: 'Videos reordered successfully'
    });

  } catch (error) {
    console.error('Reorder videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all videos with search and filter
export const getAllVideos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      moduleId, 
      isPublished, 
      page = '1', 
      limit = '10' 
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

    // Add module filter
    if (moduleId) {
      whereClause.moduleId = moduleId as string;
    }

    // Add published filter
    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished === 'true';
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: [
          { module: { course: { title: 'asc' } } },
          { module: { title: 'asc' } },
          { order: 'asc' }
        ],
        include: {
          module: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      }),
      prisma.video.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk update video status
export const bulkUpdateVideoStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { videoIds, isPublished }: { videoIds: string[]; isPublished: boolean } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'videoIds must be a non-empty array'
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

    const updatedVideos = await prisma.video.updateMany({
      where: {
        id: { in: videoIds }
      },
      data: {
        isPublished
      }
    });

    res.json({
      success: true,
      message: `${updatedVideos.count} videos updated successfully`,
      data: { updatedCount: updatedVideos.count }
    });

  } catch (error) {
    console.error('Bulk update video status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};