import { Request, RequestHandler, Response } from "express";
import userManager from "../managers/userManager";
import { User, isValidUser } from "../types/user";
import { getSelfieError } from "../types/error";
import userRepository from "../repositories/userRepository";

export const loginCallback: RequestHandler = async (req, res, next) => {
  const body = req.body;
  if (!body.userID || !body.password)
    return next(getSelfieError("LO_400", 400, "Provide userID and password"));

  const response = await userManager.login(body);
  if (!response) return next(getSelfieError("LO_404", 404, "User not found"));

  res.status(200).send(response);
};

export const resetPasswordCallback: RequestHandler = async (req, res, next) => {
  const body = req.body;
  if (!body.userID || !body.oldPassword || !body.newPassword)
    return next(getSelfieError("REP_400", 400, "Provide a valid form"));

  const isUpdated = await userManager.resetPassword(req.body);
  if (!isUpdated) return next(getSelfieError("REP_404", 404, "User not found"));

  console.log("[server]: User " + body.userID + " has resetted his password");
  res.status(200).send("");
};

export const registerCallback: RequestHandler = async (req, res, next) => {
  const body = req.body as User;

  if (!isValidUser(body))
    return next(getSelfieError("RE_001", 400, "Provide valid form"));

  try {
    await userManager.register(body);
    res.status(200).send("");
  } catch (e: any) {
    next(getSelfieError("RE_002", 400, "user already exists", e.message));
  }
};

export const activateUserCallback: RequestHandler = async (req, res, next) => {
  const token = req.query.token as string;
  if (!token)
    return next(getSelfieError("AC_001", 400, "Provide a valid token"));

  const isUpdated = await userRepository.activate(token);
  if (!isUpdated)
    return next(getSelfieError("AC_001", 400, "Provide a valid token"));

  res.status(200).send("");
};

export const getUserCallback: RequestHandler = async (req, res, next) => {
  if (!req.params.userid)
    return next(getSelfieError("USE_001", 400, "provide userID"));

  const user = await userManager.readUser(req.params.userid);
  if (!user) return next(getSelfieError("USE_002", 404, "Username not found"));

  res.status(200).json(user);
};

export const deleteUserCallback: RequestHandler = async (req, res, next) => {
  if (!req.params.userid)
    return next(getSelfieError("DEU_001", 400, "Provide userID"));

  const isDeleted = await userManager.deleteAccount(req.params.userid);
  if (!isDeleted) return next(getSelfieError("DEU_002", 404, "User not found"));

  res.status(200).send("");
};
