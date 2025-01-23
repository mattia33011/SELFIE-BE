import passwordManager from "./passwordManager";
import userRepository from "../repositories/userRepository";
import { DBUser, LoginResponse, User, UserSession } from "../types/user";
import jwtManager from "./jwtManager";
import { MongoDBErrorCode } from "../repositories/repository";
import emailManager from "./emailManager";
import { Recipient } from "mailersend";
import crypto from "crypto";
import fileManager from "./fileManager";
const generateUnivokeToken = () => crypto.randomBytes(32).toString("hex");

class UserManager {
  async insertUser(user: User, activationToken: string) {
    try {
      await userRepository.insert({
        ...user,
        password: passwordManager.crypt(user.password),
        activated: true,
        activationToken: activationToken, //Unused 
        imagePath: ''
      });
    } catch (e: any) {
      console.log(JSON.stringify(e));
      if (e.errorResponse.code == MongoDBErrorCode.DUPLICATE_KEY)
        throw new Error(Object.keys(e.errorResponse.keyPattern)[0]);
      
      throw e;
    }
  }
  async register(user:User){
    const activationToken = generateUnivokeToken();
    await this.insertUser(user, activationToken)
    
    //await this.sendActivationEmail(user,activationToken)
  }
  // Unused
  async sendActivationEmail(user: User, activationToken: string) {
    try {
      await emailManager.sendActivateAccount(
        new Recipient(user.email, `${user.firstName} ${user.lastName}`),
        activationToken
      );    
    } catch (e: any) {
      await this.deleteAccount(user.email);
      throw e;
    }
  }

  async deleteAccount(userID: string) {
    const user = await userRepository.read(userID, false, true) as DBUser
    if(user.imagePath && !(await fileManager.deleteFile(user.imagePath)))
      return false;

    return userRepository.delete(userID).then(deletedCount => deletedCount == 1);
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

  async getUserProfilePicture(userID: string){
    const user = await userRepository.read(userID,false,true) as DBUser
    if(!user || !user.imagePath)
      return undefined
    
    return await fileManager.getFile(user.imagePath)
  }
}
const userManager = new UserManager();
export default userManager;
