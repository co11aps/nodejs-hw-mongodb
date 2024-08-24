import express from 'express';
import {
  createContactController,
  deleteContactController,
  getAllContactsController,
  getContactByIdController,
  patchContactController,
  upsertContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

const jsonParser = express.json();

router.get('/contacts', auth, ctrlWrapper(getAllContactsController));

router.get(
  '/contacts/:id',
  auth,
  isValidId,
  ctrlWrapper(getContactByIdController),
);

router.post(
  '/contacts',
  auth,
  jsonParser,
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);

router.delete(
  '/contacts/:id',
  auth,
  isValidId,
  ctrlWrapper(deleteContactController),
);

router.put(
  '/contacts/:id',
  auth,
  isValidId,
  jsonParser,
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(upsertContactController),
);

router.patch(
  '/contacts/:id',
  auth,
  isValidId,
  jsonParser,
  upload.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);

export default router;
