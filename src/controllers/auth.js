import * as AuthService from '../services/auth.js';

async function register(req, res, next) {
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const registeredUser = await AuthService.registerUser(user);

  res.send({ status: 200, message: 'User registered', data: registeredUser });
}

async function login(req, res, next) {
  const { email, password } = req.body;

  const session = await AuthService.loginUser(email, password);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.send({
    status: 200,
    message: 'Login completed',
    data: { accessToken: session.accessToken },
  });
}

async function logout(req, res, next) {
  if (typeof req.cookies.sessionId === 'string') {
    await AuthService.logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).end();
}

export { register, login, logout };
