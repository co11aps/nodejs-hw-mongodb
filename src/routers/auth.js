import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { register } from '../controllers/auth.js';

const router = express.Router();
const jsonParser = express.json();

router.post('auth/register', jsonParser, ctrlWrapper(register));

export default router;
