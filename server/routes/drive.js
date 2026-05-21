import express from 'express';
import multer from 'multer';
import { listFiles, createFolder, deleteFile, renameFile, uploadFiles, getStorageQuota } from '../controllers/driveController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(isAuthenticated);

router.get('/', listFiles);
router.get('/quota', getStorageQuota);
router.post('/folder', createFolder);
router.post('/upload', upload.array('files'), uploadFiles);
router.delete('/:id', deleteFile);
router.patch('/:id', renameFile);

export default router;