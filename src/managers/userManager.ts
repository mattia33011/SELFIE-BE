import passwordManager from './passwordManager';
import userRepository from '../repositories/userRepository';
import { LoginResponse, User, UserSession } from '../types/user';
import jwtManager from './jwtManager';

class UserManager {
  async insertUser(user: User) {
    await userRepository.insert({
      ...user,
      password: passwordManager.crypt(user.password),
    });
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
    const { password, ...user } = (await userRepository.read(
      form.userID,
      true
    )) as User;
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