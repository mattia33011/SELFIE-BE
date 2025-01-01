import { Collection, WithId } from 'mongodb';
import { User, UserSession } from '../types/user';
import repository from './repository';

class UserRepository {
  async updatePassword(user: User, newPassword: string): Promise<boolean> {
    return (
      await this.users.updateOne(
        { $or: [{ email: user.email }, { username: user.username }] },
        {$set: {password: newPassword}}
      )
    ).acknowledged;
  }
  private users: Collection;

  constructor() {
    this.users = repository.client.collection('users',);
    this.users.createIndex({ email: 1 }, { unique: true });
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  async insert(user: User) {
    return this.users.insertOne(user);
  }

  async read(
    userID: string,
    showPassword?: boolean
  ): Promise<User | UserSession | undefined> {
    return this.users
      .findOne(
        {
          $or: [{ email: userID }, { username: userID }],
        },
        {
          showRecordId: false,
          projection: showPassword
            ? { _id: 0 }
            : {
                password: 0,
                _id: 0,
              },
        }
      )
      .then((user: any) =>
        showPassword
          ? (user as User)
          : ({ ...user, password: undefined, _id: undefined } as UserSession)
      );
  }
}

const userRepository = new UserRepository();
export default userRepository;
