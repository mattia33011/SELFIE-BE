import { RequestHandler } from "express";
import userManager from "../managers/userManager";
import userRepository from "../repositories/userRepository";
import { User, isValidUser } from "../types/user";
import {getSelfieError, SelfieError} from "../types/errors";
import { noteManager } from "../managers/noteManager";
import { eventManager } from "../managers/eventManager";
import { pomodoroManager } from "../managers/pomodoroManager";
import {
  Pomodoro,
  StudySession,
  Task,
  isEvent,
  isNote,
  isNoteList,
  isPomodoro,
  isSession,
  isTask,
} from "../types/event";
import { nextTick } from "process";
import { convertNumericObjectToArray } from "../utils";
import ProjectRepository from "../repositories/projectRepository";
import {Project, ProjectCreateRequest} from "../types/project";
import {projectManager, ProjectManager} from "../managers/projectManager";

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

export const autoSuggestUsersCallback: RequestHandler = async (req, res, next) => {
  const userId = req.params.userid
  const partialUsername = req.body.partialUsername;
  try {
    const data = await userManager.autoSuggestName(partialUsername, userId);
    res.status(200).send(data);
  } catch (e: any) {
    return next(e);
  }
};

export const getNotesCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const userId = req.user.userid;
  try{
    const data = await noteManager.fetchNotes(userId);
    if(data.length == 0) {
      return next(getSelfieError("NOTE_404", 404, "No notes found"));
    }
    res.status(200).json(data);
    } catch (e: any) {
      return next(e);
    }
};

export const postNotesCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = req.body;

  try{
      const note = await noteManager.insertNote(body, email);
      res.status(200).json(note);
  } catch (e: any) {
    return next(e);
  }
};

export const deleteNotesCallback: RequestHandler = async (req, res, next) => {
  const noteId = req.params.noteid;
  const userId = req.params.userid;
  try{
    const data = await noteManager.deleteNote(noteId, userId);
    res.status(200).json("note deleted successfully");
  }catch (e: any) {
    return next(e);
  }
}

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
    return next(getSelfieError("NOTE_001", 404, "pomodoro not found"));
  }
};

export const postPomodoroCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const body = req.body as Pomodoro;
  const userId=req.params.userid;

  try{
    await pomodoroManager.save(body, userId);
    res.status(200).json("Pomodoro updated successfully");
  } catch (e: any) {
    return next(e);
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

export const putStudySessionsCallback: RequestHandler = async (
  req,
  res,
  next
) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = convertNumericObjectToArray(req.body) as StudySession[];
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
    console.log(data);
    
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

export const putTasksCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));
  //@ts-ignore
  const { email } = req?.user;

  const body = convertNumericObjectToArray(req.body) as Task[];
  if (body == undefined || body.find((it) => !isTask(it)))
    return next(getSelfieError("NOTE_002", 400, "Body is invalid"));

  try {
    const data = await pomodoroManager.updateTask(body, email);

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



//Projects callbacks
export const saveProjectCallback: RequestHandler = async (
  req,
  res,
  next,
) => {
const body = req.body as ProjectCreateRequest
const userId = req.params.userid
try{
  const data = await projectManager.saveProject(userId, body);
  res.status(200).json("Project Saved successfully");
} catch (e: any) {
  return next(
      getSelfieError("PROJECT_500", 500, "Internal server error, try again later").toJSON()
  );
}
}

export const addProjectTaskCallback: RequestHandler = async (
  req,
  res,
  next,
) => {
const userId = req.params.userid
const projectId = req.body.projectId
const task = req.body.task
try{
  const project = await projectManager.addTask(userId,projectId,task)
  res.status(200).json(project);
} catch (e: any) {
  return next(e)
}
}

export const updateProjectCallback: RequestHandler = async (req, res, next) => {
const project = req.body.project as Project;
const userid = req.params.userid;
try {
  await projectManager.updateProject(userid, project);
  res.status(200).json("Project updated successfully");
} catch (e: any) {
  return next(e);
}
};

export const fetchProjectsCallback: RequestHandler = async (req, res, next) => {
const userId = req.params.userid
try {
  const data = await projectManager.fetchUserProjects(userId);
  if (data.length == 0) {
    return next(
        getSelfieError("PROJECT_404", 404 , "No project found")
    );
  }
  res.status(200).json(data);
} catch (e: any) {
  return next(e);
}
};

export const filterProjectsCallback: RequestHandler = async (req, res, next) => {
const filter = req.body as Partial<Project>
const userId = req.params.userid;
try {
  const data = await projectManager.findWithFilter(userId, filter)
  res.status(200).json(data);
} catch (e: any) {
  return next(e);
}
};

export const deleteProjectCallback: RequestHandler = async (req, res, next) => {
const projectid = req.params.projectid;
const userid = req.params.userid;
try {
  const data = await projectManager.deleteProject(userid, projectid);
  res.status(200).json("Project deleted successfully");
} catch (e: any) {
  return next(e);
}
};


//Projects callbacks

export const putEventsCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const { email } = req.user;
  const _id = req.params.eventid;
  const body = req.body;

  if (_id == undefined || !isEvent(body)) {
    return next(getSelfieError("EVENT_002", 400, "Body is invalid"));
  }

  try {
    const updatedId = await eventManager.update(_id, email, body);
    
    res.status(200).send(updatedId);
  } catch (err) {
    return next(err);
  }
};


export const deleteEventsCallback: RequestHandler = async (req, res, next) => {
  //@ts-ignore
  if (!req.user?.email)
    return next(getSelfieError("SE_001", 401, "Cannot find any logged user"));

  //@ts-ignore
  const { email } = req.user;
  const _id = req.params.eventid;

  if (_id == undefined) {
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



