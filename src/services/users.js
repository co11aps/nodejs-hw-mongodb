import bcrypt from 'bcrypt';
import { UsersCollection } from '../models/user.js';

async function createUser(user) {
  user.password = await bcrypt.hash(user.password, 10);
  return UsersCollection.create(user);
}

export { createUser };
