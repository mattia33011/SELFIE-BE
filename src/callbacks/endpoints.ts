import { RequestHandler } from "express";
import userManager from "../managers/userManager";
import userRepository from "../repositories/userRepository";
import { User, isValidUser } from "../types/user";
import { getSelfieError } from "../types/errors";
import { noteManager } from "../managers/noteManager";
import { eventManager } from "../managers/eventManager";
import { pomodoroManager } from "../managers/pomodoroManager";
import {
  Session,
  Task,
  Tasks,
  isEvent,
  isNote,
  isNoteList,
  isPomodoro,
  isSession,
  isTask,
} from "../types/event";
import { nextTick } from "process";
import { convertNumericObjectToArray } from "../utils";
import { ObjectId } from "mongodb";
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
  try {
    userManager.putProfilePicture(username ?? email, req.file);
  } catch (e: any) {
    return next(e);
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

export const getNotesCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const { email } = req?.user;
  const dateFilter = req.query.dateFilter
    ? new Date(req.query.dateFilter as string)
    : undefined;
  try {
    const data = await noteManager.fetchNotes(email, dateFilter);
    res.status(200).json(data);
  } catch (e: any) {
    return next(getSelfieError("NOTE_001", 404, "Notes not found"));
  }
};

export const postNotesCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = req.body;
  if (!isNote(body))
    return next(getSelfieError("NOTE_002", 400, "Body is invalid"));

  try {
    const data = await noteManager.insert(body, email);

    if (!data) {
      return next(
        getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
      );
    }

    res.status(200).json(data);
  } catch (e: any) {
    return next(
      getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
    );
  }
};

//array di note recenti
export const getRecentNotesCallback: RequestHandler = async (
  req,
  res,
  next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;
  try {
    const data = await noteManager.fetchRecentNotes(email);
    res.status(200).json(data);
  } catch (e: any) {
    return next(getSelfieError("NOTE_001", 404, "Recent otes not found"));
  }
};

export const postRecentNotesCallback: RequestHandler = async (
  req,
  res,
  next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = req.body;
  if (!isNoteList(body))
    return next(getSelfieError("NOTE_002", 400, "Body is invalid"));

  try {
    // Insert each note in the array individually
    const results = await Promise.all(
      body.map((note: any) => noteManager.insertRecent(note, email))
    );

    // If any insert failed, return error
    if (results.some((result) => !result)) {
      return next(
        getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
      );
    }

    res.status(200).json(results);
  } catch (e: any) {
    return next(
      getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
    );
  }
};

//deve darmi la sessione di pomodoro
export const getPomodoroCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;
  try {
    const data = await pomodoroManager.fetchPomodoro(email);
    res.status(200).json(data);
  } catch (e: any) {
    return next(getSelfieError("NOTE_001", 404, "Recent otes not found"));
  }
};

export const postPomodoroCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = req.body;
  if (!isPomodoro(body))
    return next(getSelfieError("NOTE_002", 400, "Body is invalid"));

  try {
    const data = await pomodoroManager.save(body, email);

    if (!data) {
      return next(
        getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
      );
    }

    res.status(200).json(data);
  } catch (e: any) {
    console.error(e)
    return next(
      getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
    );
  }
};

//mi da la lista di sessioni passate (comprende numero di pomodori fatti e task completate)
export const getStudySessionsCallback: RequestHandler = async (
  req,
  res,
  next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const { email } = req?.user;

  try {
    const data = await pomodoroManager.fetchStudySessions(email);
    res.status(200).json(data);
  } catch (e: any) {
    return next(getSelfieError("NOTE_001", 404, "Notes not found"));
  }
};

export const postStudySessionsCallback: RequestHandler = async (
  req,
  res,
  next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = convertNumericObjectToArray(req.body) as Session[];
  if (body == undefined || body.find((it) => !isSession(it)))
    return next(getSelfieError("NOTE_002", 400, "Body is invalid"));

  try {
    const data = await pomodoroManager.insertStudySession(body, email);

    if (!data) {
      return next(
        getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
      );
    }

    res.status(200).json(data);
  } catch (e: any) {
    return next(
      getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
    );
  }
};

export const deleteStudySessionsCallback: RequestHandler = async (
  req,
  res,
  next
) => {
  if (!req.params.userid)
    return next(getSelfieError("DEU_001", 400, "Provide userID"));
  if (!req.params.sessionid)
    return next(getSelfieError("DEU_001", 400, "Provide sessionID"));

  const isDeleted = await pomodoroManager.deleteStudySession(
    req.params.sessionid,
    req.params.userid
  );
  if (!isDeleted) return next(getSelfieError("DEU_002", 404, "User not found"));

  res.status(200).send("");
};

//mi da la lista di task
export const getTasksCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const { email } = req?.user;
  try {
    const data = await pomodoroManager.fetchTasks(email);
    res.status(200).json(data);
  } catch (e: any) {
    return next(getSelfieError("NOTE_001", 404, "Notes not found"));
  }
};

export const postTasksCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = convertNumericObjectToArray(req.body) as Task[];
  if (body == undefined || body.find((it) => !isTask(it)))
    return next(getSelfieError("NOTE_002", 400, "Body is invalid"));

  try {
    const data = await pomodoroManager.insertTask(body, email);

    if (!data) {
      return next(
        getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
      );
    }

    res.status(200).json(data);
  } catch (e: any) {
    console.log(e);
    return next(
      getSelfieError("NOTE_003", 500, "ops, there was an error, try later")
    );
  }
};
export const deleteTasksCallback: RequestHandler = async (req, res, next) => {
  if (!req.params.userid)
    return next(getSelfieError("DEU_001", 400, "Provide userID"));
  if (!req.params.taskid)
    return next(getSelfieError("DEU_001", 400, "Provide taskid"));

  const isDeleted = await pomodoroManager.deleteTask(
    req.params.taskid,
    req.params.userid
  );
  if (!isDeleted) return next(getSelfieError("DEU_002", 404, "User not found"));

  res.status(200).send("");
};

export const getEventsCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;
  try {
    const data = await eventManager.fetchEvents(email);
    res.status(200).json(data);
  } catch (e: any) {
    return next(getSelfieError("EVENT_001", 404, "Events not found"));
  }
};

export const postEventsCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = req.body;
  if (!isEvent(body))
    return next(getSelfieError("EVENT_002", 400, "Body is invalid"));

  try {
    const data = await eventManager.insert(body, email);

    if (!data) {
      return next(
        getSelfieError("EVENT_003", 500, "ops, there was an error, try later")
      );
    }

    res.status(200).json(data);
  } catch (e: any) {
    return next(
      getSelfieError("EVENT_003", 500, "ops, there was an error, try later")
    );
  }
};

export const deleteEventsCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const { email } = req.user;
  const _id = req.body._id;

  if (typeof _id !== "string" || !isEvent(_id)) {
    return next(getSelfieError("EVENT_002", 400, "Body is invalid"));
  }

  try {
    const isDeleted = await eventManager.delete(_id, email);
    if (!isDeleted)
      return next(getSelfieError("EVENT_004", 404, "Event not found"));

    res.status(200).send("");
  } catch (err) {
    return next(err);
  }
};



