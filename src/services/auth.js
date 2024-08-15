import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';

async function registerUser(user) {
  const isExistedUser = await UsersCollection.findOne({ email: user.email });

  if (isExistedUser !== null) {
    throw createHttpError(409, 'Email already in use');
  }

  user.password = await bcrypt.hash(user.password, 10);
  return UsersCollection.create(user);
}

async function loginUser(email, password) {
  const isExistedUser = await UsersCollection.findOne({ email });
  if (isExistedUser === null) {
    throw createHttpError(404, 'User not found ');
  }

  const isMatch = await bcrypt.compare(password, isExistedUser.password);
  if (isMatch === false) {
    throw createHttpError(401, 'Unauthorized');
  }
}

export { registerUser, loginUser };
