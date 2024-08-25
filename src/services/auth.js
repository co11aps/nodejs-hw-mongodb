import * as fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';

// import { SMTP } from '../constants/index.js';

import { sendEmail } from '../utils/sendMail.js';

import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  SMTP,
  TEMPLATE_DIR,
} from '../constants/index.js';

import { validateCode } from '../utils/googleOAuth2.js';

async function registerUser(user) {
  const isExistedUser = await UsersCollection.findOne({ email: user.email });

  if (isExistedUser !== null) {
    throw createHttpError(409, 'Email already in use');
  }

  user.password = await bcrypt.hash(user.password, 10);
  return UsersCollection.create(user);
}

const createSession = () => {
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TTL),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TTL),
  };
};

async function loginUser(email, password) {
  const isExistedUser = await UsersCollection.findOne({ email });
  if (isExistedUser === null) {
    throw createHttpError(404, 'User not found ');
  }

  const isMatch = await bcrypt.compare(password, isExistedUser.password);
  if (isMatch === false) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: isExistedUser._id });

  const newSession = createSession();

  return SessionsCollection.create({
    userId: isExistedUser._id,
    ...newSession(),
  });
}

function logoutUser(sessionId) {
  return SessionsCollection.deleteOne({ _id: sessionId });
}

async function refreshUserSession(sessionId, refreshToken) {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (session === null) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > new Date(session.refreshTokenValidUntil)) {
    throw createHttpError(401, 'Refresh token is expired');
  }

  await SessionsCollection.deleteOne({ _id: sessionId });

  const newSession = createSession();

  return SessionsCollection.create({
    userId: session.userId,
    ...newSession(),
  });
}

async function requestResetEmail(email) {
  const user = await UsersCollection.findOne({ email });

  if (user === null) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const templateFile = path.join(TEMPLATE_DIR, 'reset-password-email.html');

  const templateSource = await fs.readFile(templateFile, 'utf8');

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: SMTP.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html,
  });
}

async function resetPassword(password, token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    const user = await UsersCollection.findOne({
      _id: decoded.sub,
      email: decoded.email,
    });

    if (user === null) {
      throw createHttpError(404, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UsersCollection.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      throw createHttpError(401, 'Token not valid or expired');
    }
    throw error;
  }
}

async function loginOrRegisterWithGoogle(code) {
  const ticket = await validateCode(code);

  const payload = ticket.getPayload();

  if (typeof payload === 'undefined') {
    throw createHttpError(401, 'Unauthorized');
  }

  const user = await UsersCollection.findOne({ email: payload.email });

  if (user === null) {
    const password = await bcrypt.hash(
      crypto.randomBytes(30).toString('base64'),
      10,
    );

    const createdUser = await UsersCollection.create({
      email: payload.email,
      name: payload.name,
      password,
    });

    return SessionsCollection.create({
      userId: createdUser._id,
      accessToken: crypto.randomBytes(30).toString('base64'),
      refreshToken: crypto.randomBytes(30).toString('base64'),
      accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TTL),
      refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  return SessionsCollection.create({
    userId: user._id,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TTL),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });
}

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  requestResetEmail,
  resetPassword,
  loginOrRegisterWithGoogle,
};
