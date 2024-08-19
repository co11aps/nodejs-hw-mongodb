import crypto from 'node:crypto';

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';

import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../constants/index.js';

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

  SessionsCollection.deleteOne({ userId: isExistedUser._id });

  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return SessionsCollection.create({
    userId: isExistedUser._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TTL),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });
}

export { registerUser, loginUser };
