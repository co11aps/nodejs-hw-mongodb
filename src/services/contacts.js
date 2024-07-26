import { ContactsCollection } from '../models/contact.js';

export const getAllContacts = () => ContactsCollection.find();

export const getContactById = (contactId) =>
  ContactsCollection.findById(contactId);

export const createContactService = (newContactData) =>
  ContactsCollection.create(newContactData);

export const deleteContactService = (contactId) =>
  ContactsCollection.findByIdAndDelete(contactId);

export const updateContactService = (contactId, contact, options = {}) =>
  ContactsCollection.findByIdAndUpdate(contactId, contact, {
    new: true,
    ...options,
  });
