import passwordManager from "./passwordManager";
import userRepository from "../repositories/userRepository";
import { LoginResponse, User, UserSession } from "../types/user";
import jwtManager from "./jwtManager";
import { MongoDBErrorCode } from "../repositories/repository";

class UserManager {
  async insertUser(user: User) {
    try {
      await userRepository.insert({
        ...user,
        password: passwordManager.crypt(user.password),
      });
    } catch (e: any) {
      console.log(JSON.stringify(e.errorResponse));
      if( e.errorResponse.code == MongoDBErrorCode.DUPLICATE_KEY)
        throw new Error(Object.keys(e.errorResponse.keyPattern)[0])
      throw new Error()
    }
  }

  async resetPassword(form: {
    userID: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<boolean> {
    const user = (await userRepository.read(form.userID, true)) as User;

    if (!passwordManager.compare(form.oldPassword, user.password)) return false;

    return await userRepository.updatePassword(
      user,
      passwordManager.crypt(form.newPassword)
    );
  }

  async login(form: {
    userID: string;
    password: string;
  }): Promise<LoginResponse | undefined> {
    const repositoryResult = (await userRepository.read(
      form.userID,
      true
    )) as User;
    if (!repositoryResult) return undefined;
    const { password, ...user } = repositoryResult;

    if (!user) return undefined;

    if (!passwordManager.compare(form.password, password)) return undefined;

    return {
      token: jwtManager.generateJwt(user),
      user: {
        ...user,
      },
    };
  }
  async readUser(userID: string): Promise<UserSession | undefined> {
    return (await userRepository.read(userID)) as UserSession;
  }
}
const userManager = new UserManager();
export default userManager;
