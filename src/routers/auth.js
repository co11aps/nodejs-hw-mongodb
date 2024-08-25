import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  register,
  login,
  logout,
  refresh,
  requestResetEmail,
  resetPassword,
  getGoogleOAuthUrlController,
  loginWithGoogleController,
} from '../controllers/auth.js';

import { validateBody } from '../middlewares/validateBody.js';

import {
  registerSchema,
  loginSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
  loginWithGoogleOAuthSchema,
} from '../validation/auth.js';

const router = express.Router();
const jsonParser = express.json();

router.post(
  '/auth/register',
  jsonParser,
  validateBody(registerSchema),
  ctrlWrapper(register),
);

router.post(
  '/auth/login',
  jsonParser,
  validateBody(loginSchema),
  ctrlWrapper(login),
);

router.post('/auth/logout', ctrlWrapper(logout));

router.post('/auth/refresh', ctrlWrapper(refresh));

router.post(
  '/auth/send-reset-email',
  jsonParser,
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmail),
);

router.post(
  '/auth/reset-pwd',
  jsonParser,
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPassword),
);

router.get('/auth/get-oauth-url', ctrlWrapper(getGoogleOAuthUrlController));

router.post(
  '/auth/confirm-oauth',
  validateBody(loginWithGoogleOAuthSchema),
  ctrlWrapper(loginWithGoogleController),
);

export default router;
