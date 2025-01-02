import { Request, Response } from "express";
import userManager from "../managers/userManager";
import { User, isValidUser } from "../types/user";
import { SelfieError, getSelfieError } from "../types/error";

export const loginCallback = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.userID || !body.password) {
    res.status(400).send(getSelfieError("LO_400", 400, "Provide userID and password"));
    return;
  }

  const response = await userManager.login(body);
  if (!response) {
    res.status(404).send(getSelfieError("LO_404", 404, "User not found"));
    return;
  }

  res.status(200).send(response);
};

export const resetPasswordCallback = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.userID || !body.oldPassword || !body.newPassword) {
    res.status(400).send(getSelfieError("REP_400", 400, "Provide a valid form"));
    return;
  }

  const isUpdated = await userManager.resetPassword(req.body);
  if (!isUpdated) {
    res.status(404).send(getSelfieError("REP_404", 404, "User not found"));
    return;
  }
  console.log("[server]: User " + body.userID + " has resetted his password");
  res.status(200).send("");
};

export const registerCallback = async (req: Request, res: Response) => {
  const body = req.body as User;

  if (!isValidUser(body)) {
    res.status(400).send(getSelfieError('RE_001', 400, "Provide valid form"));
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
    console.log(e)
    res.status(400).send(getSelfieError('RE_002', 400, 'user already exists', e.message));
  }
};

export const getUserCallback = async (req: Request, res: Response) => {
  if (!req.params.userid) {
    res.status(400).send({ error: "provide userID" });
    return;
  }
  const user = await userManager.readUser(req.params.userid);
  if (user) {
    res.status(200).send(user);
    return;
  }
  res.status(404).send({ error: "username not found" });
};
