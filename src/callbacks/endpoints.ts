import { Request, Response } from "express";
import userManager from "../managers/userManager";
import { User, isValidUser } from "../types/user";

export const loginCallback = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.userID || !body.password) {
    res.status(400).send({ error: "provide UserID and Password" });
    return;
  }

  const response = await userManager.login(body);
  if (!response) {
    res.status(404).send({ error: "user not found" });
    return;
  }

  res.status(200).send(response);
};

export const resetPasswordCallback = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.userID || !body.oldPassword || !body.newPassword) {
    res.status(400).send({ error: "provide a valid form" });
    return;
  }

  const isUpdated = await userManager.resetPassword(req.body);
  if (!isUpdated) {
    res.status(404).send({ error: "User not found" });
    return;
  }
  console.log("[server]: User " + body.userID + " resetted his password");
  res.status(200).send("");
};

export const registerCallback = async (req: Request, res: Response) => {
  const body = req.body as User;

  if (!isValidUser(body)) {
    res.status(400).send({ error: "provide valid form" });
    return;
  }

  try {
    await userManager.insertUser(body);
    console.log("[server]: New User " + body.email + " created");
    res.status(200).send("");
    return;
  } catch (e: any) {
    console.error(
      "[server]: User " + body.email + " can't be created, already exists"
    );
    res.status(400).send({ error: "user already exists" });
  }
};

export const getUserCallback = async (req: Request, res: Response) => {
  if (!req.params.userid) {
    res.status(400).send({ error: 'provide userID' });
    return;
  }
  const user = await userManager.readUser(req.params.userid);
  if (user) {
    res.status(200).send(user);
    return;
  }
  res.status(404).send({ error: 'username not found' });
}

