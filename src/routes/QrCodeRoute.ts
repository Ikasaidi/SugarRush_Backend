import { Router } from 'express';
import { createQrCodeHandler } from '../controllers/QrCodeController';

const router = Router();

// Route to generate a new QR code
router.post('/generate', createQrCodeHandler);

export default router;
