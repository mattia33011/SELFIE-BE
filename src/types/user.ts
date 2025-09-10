import { Binary, ObjectId } from "mongodb";
import timeMachine from "../managers/timeMachine";

export type UserSession = Omit<User, 'password'>;

export type User = {
  firstName: string;
  lastName: string;
  birthDate: Date;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
};

export type DBUser = User & {_id: ObjectId, activated: boolean, activationToken?: string, profilePicture?: Binary}
export function isValidUser(user: User) {
  try {
    // Check if something is undefined
    Object.entries(user).forEach(([key, value]) => {
      if (!user[key as keyof User]) throw key;
    });

    if (!emailRegex.exec(user.email)) throw new Error('email');
    if (!phoneNumberRegex.exec(user.phoneNumber)) throw new Error('phoneNumber');
    if (!passwordRegex.exec(user.password)) throw new Error('password');
    if (user.birthDate > timeMachine.getToday()) throw new Error('birthDate');

    return true;
  } catch (e: any) {
    return false;
  }
}
export type LoginResponse = {
  user: UserSession;
  token: string;
};

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/;
export const phoneNumberRegex =
  /^[\+]?[0-9]{0,3}\W?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])(?=.{8,})/;


  