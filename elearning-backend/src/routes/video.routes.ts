import express from 'express';
import {
  createVideo,
  getVideosByModule,
  getVideoById,
  updateVideo,
  deleteVideo,
  updateVideoProgress,
  getVideoProgress,
  reorderVideos,
  getAllVideos,
  bulkUpdateVideoStatus
} from '../controllers/videoController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, createVideo);
router.get('/module/:moduleId', authMiddleware, getVideosByModule);
router.get('/:id', authMiddleware, getVideoById);
router.put('/:id', authMiddleware,  updateVideo);
router.delete('/:id', authMiddleware, deleteVideo);
router.put('/:id/progress', authMiddleware, updateVideoProgress);
router.get('/:id/progress', authMiddleware, getVideoProgress);
router.put('/module/:moduleId/reorder', authMiddleware, reorderVideos);
router.get('/', authMiddleware, getAllVideos);
router.put('/bulk-status', authMiddleware, bulkUpdateVideoStatus);

export default router;