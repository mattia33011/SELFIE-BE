import { RequestHandler } from "express";
import userManager from "../managers/userManager";
import userRepository from "../repositories/userRepository";
import { User, isValidUser } from "../types/user";
import { getSelfieError } from "../types/errors";
import {noteManager} from "../managers/noteManager";
import {eventManager} from "../managers/eventManager";
import {isEvent, isNote} from "../types/event";

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

export const profilePictureUploadMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  if (!req.file) {
    return next(getSelfieError("USE_003", 400, "File not uploaded"));
  }
  //@ts-ignore
  if (!req?.user?.username && !req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
    const { username, email } = req?.user;
    try{
    userManager.putProfilePicture(username ?? email, req.file);
  }
  catch(e: any){
    return next(e)
  }

  res.status(200).json({
    message: "File uploaded successfully",
  });
};

export const getProfilePictureCallback: RequestHandler = async (
  req,
  res,
  next
) => {
  const userid = req.params.userid;
  if (!userid) return next(getSelfieError("USE_001", 400, "provide user id"));

  const data = await userManager.getUserProfilePicture(userid);
  if (!data)
    return next(
      getSelfieError("USE_004", 404, "User does not have a profile picture")
    );

  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
  });
  res.write(data.buffer);
  res.end();
};


export const getNotesCallback: RequestHandler = async (
    req,
    res,
    next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const { email } = req?.user;
  const dateFilter = req.query.dateFilter ? new Date(req.query.dateFilter as string) : undefined;
  try{
    const data = await noteManager.fetchNotes(email,dateFilter)
    res.status(200).json(data);
  }
  catch(e: any){
    return next(getSelfieError("NOTE_001", 404, "Notes not found"))
  }
}

export const postNotesCallback: RequestHandler = async (
    req,
    res,
    next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = req.body
  if(!isNote(body))
    return next(getSelfieError("NOTE_002", 400, "Body is invalid"))

  try{
    const data = await noteManager.insert(body, email,)

    if(!data){
      return next(getSelfieError("NOTE_003", 500, "ops, there was an error, try later"));
    }

    res.status(200).json(data);
  }
  catch(e: any){
    return next(getSelfieError("NOTE_003", 500, "ops, there was an error, try later"));
  }
}

export const getEventsCallback: RequestHandler = async (
    req,
    res,
    next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;
  try{
    const data = await eventManager.fetchNotes(email)
    res.status(200).json(data);
  }
  catch(e: any){
    return next(getSelfieError("EVENT_001", 404, "Events not found"))
  }
}

export const postEventsCallback: RequestHandler = async (
    req,
    res,
    next
) => {
//@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = req.body
  if(!isEvent(body))
    return next(getSelfieError("EVENT_002", 400, "Body is invalid"))

  try{
    const data = await eventManager.insert(body, email,)

    if(!data){
      return next(getSelfieError("EVENT_003", 500, "ops, there was an error, try later"));
    }

    res.status(200).json(data);
  }
  catch(e: any){
    return next(getSelfieError("EVENT_003", 500, "ops, there was an error, try later"));
  }
}