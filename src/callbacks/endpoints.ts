import { RequestHandler } from "express";
import userManager from "../managers/userManager";
import userRepository from "../repositories/userRepository";
import { Readable } from "stream";
import { getSelfieError } from "../types/error";
import { User, isValidUser } from "../types/user";
import { log } from "console";

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
    log(JSON.stringify(e))
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

  res.status(200).json({
    message: "File uploaded successfully",
  });
};

export const getProfilePictureCallback: RequestHandler = async (req, res, next) => {
  const userid = req.params.userid
  if(!userid)
    return next(getSelfieError('USE_001', 400, 'provide user id'))
  
  const data = await userManager.getUserProfilePicture(userid)
  if(!data)
    return next(getSelfieError('USE_004', 404, 'User does not have a profile picture'))

  res.setHeader('Content-Type', data.ContentType ?? 'application/octet-stream');
// Imposta l'intestazione Content-Disposition
res.setHeader('Content-Disposition', `inline; filename="${userid}"`);

  const fileStream = data.Body! as Readable; // Questo è un flusso di lettura
  
  fileStream.on('data', chunk => {
    res.write(chunk);  // Scrivi ogni chunk nel corpo della risposta
  });

  // Quando il flusso è finito, chiudi la risposta
  fileStream.on('end', () => {
    res.end().status(200);
  });

  // Gestisci eventuali errori nel flusso
  fileStream.on('error', (err) => {
    console.error('Errore nel flusso di dati:', err);
    res.status(500).send('Errore nel recupero del file');
  });
}