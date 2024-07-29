import {
  createContactService,
  getAllContacts,
  getContactById,
  deleteContactService,
  updateContactService,
} from '../services/contacts.js';
import createHttpError from 'http-errors';

export const getAllContactsController = async (req, res) => {
  const contacts = await getAllContacts();
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { id } = req.params;
  const contact = await getContactById(id);
  if (!contact) {
    throw createHttpError(404, 'Student not found');
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  const contact = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    isFavourite: req.body.isFavourite,
    contactType: req.body.contactType,
  };
  const createdContact = await createContactService(contact);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: createdContact,
  });
  console.log({ createdContact });
};

export const deleteContactController = async (req, res, next) => {
  const { id } = req.params;
  const deletedContact = await deleteContactService(id);
  if (!deletedContact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).end();
};

export const upsertContactController = async (req, res, next) => {
  const contact = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    isFavourite: req.body.isFavourite,
    contactType: req.body.contactType,
  };
  const { id } = req.params;
  const updatedContact = await updateContactService(id, contact, {
    upsert: true,
  });
  if (!updatedContact) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }
  res
    .status(200)
    .json({ status: 200, message: 'Contact updated', data: updatedContact });
};

export const patchContactController = async (req, res, next) => {
  const { id } = req.params;
  const result = await updateContactService(id, req.body);
  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};
