import { SORT_ORDER } from '../constants/index.js';
import { ContactsCollection } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();
  const contactsCount = await ContactsCollection.find()
    .merge(contactsQuery)
    .countDocuments();

  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

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
