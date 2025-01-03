import { Collection } from "mongodb";
import { DBUser, User, UserSession } from "../types/user";
import { Repository } from "./repository";

class UserRepository extends Repository {
  async updatePassword(user: User, newPassword: string): Promise<boolean> {
    return (
      await this.users.updateOne(
        { $or: [{ email: user.email }, { username: user.username }] },
        { $set: { password: newPassword } }
      )
    ).acknowledged;
  }
  private readonly users: Collection;

  constructor() {
    super();
    this.users = this.client.collection("users");
    this._setup_collection();
  }

  private async _setup_collection() {
    await this.users.createIndex({ email: 1 }, { unique: true });
    await this.users.createIndex({ username: 1 }, { unique: true });
  }

  async insert(user: DBUser) {
    return this.users.insertOne(user);
  }
  async delete(userID: string) {
    return (
      await this.users.deleteOne({
        $or: [{ email: userID }, { username: userID }],
      })
    ).deletedCount;
  }
  async read(
    userID: string,
    showPassword?: boolean
  ): Promise<User | UserSession | undefined> {
    return this.users
      .findOne(
        {
          $or: [{ email: userID }, { username: userID }],$and: [{activated: true}],
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
          : ({ ...user, password: undefined, _id: undefined, activated: undefined } as UserSession)
      );
  }
  async activate(token: string){
    return this.users.updateOne({$and: [{activationToken: token}, {activated: false}]}, {$set: {activated: true}, $unset: {activationToken: ''}}).then(res => res.modifiedCount == 1)
  }
}

const userRepository = new UserRepository();
export default userRepository;
