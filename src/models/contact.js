import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      required: true,
      enum: ['work', 'home', 'personal'],
      default: 'personal',
    },
  },
  {
    timestamps: true,
  },
);

const ContactsCollection = mongoose.model('Contact', contactSchema);

export { ContactsCollection };

// {
//   "name": "Dmytro Boyko",
//   "phoneNumber": "+380000000002",
//   "email": null,
//   "isFavourite": false,
//   "contactType": "personal",
//   "createdAt": "2024-05-08T16:12:14.954163",
//   "updatedAt": "2024-05-08T16:12:14.954164"
// }
