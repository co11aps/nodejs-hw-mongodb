import * as UserService from '../services/users.js';

async function register(req, res, next) {
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const createdUser = await UserService.createUser(user);

  res.send({ status: 200, message: 'User registered', data: createdUser });
}

export { register };
