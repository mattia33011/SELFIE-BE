// Local purposes
//require("dotenv").config();

import { checkDbConnection } from "./repositories/repository";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import {
  activateUserCallback,
  deleteUserCallback,
  getProfilePictureCallback,
  getUserCallback,
  loginCallback,
  profilePictureUploadMiddleware,
  registerCallback,
  resetPasswordCallback,
  getNotesCallback,
  putNotesCallback,
  moveNotesCallback,
  deleteNotesCallback,
  getEventsCallback,
  postEventsCallback,
  putEventsCallback,
  getPomodoroCallback,
  deleteEventsCallback,
  postPomodoroCallback,
  getRecentNotesCallback,
  postRecentNotesCallback,
  getTasksCallback,
  postTasksCallback,
  putTasksCallback,
  getStudySessionsCallback,
  putStudySessionsCallback,
  deleteStudySessionsCallback,
  getStudyPlanCallback,
  putStudyPlanCallback,
  deleteStudyPlanCallback,
  deleteTasksCallback,
  saveProjectCallback,
  fetchProjectsCallback,
  deleteProjectCallback,
  filterProjectsCallback,
  autoSuggestUsersCallback,
  updateProjectCallback,
  addProjectTaskCallback,
  getToday,
  setToday,
  resetToday,
  saveNoteCallback
} from "./callbacks/endpoints";
import { errorHandler, jwtMiddleWare, logRequest } from "./callbacks/mddleware";
import multer from "multer";
import path from 'path';
import emailManager from "./managers/emailManager";
import templateRepository from "./repositories/templateRepository";
import templateManager from "./managers/templateManager";

const app: Express = express();

const multerMiddleware = multer();

//Enable CORS (Cross ORigin Site)
app.use(cors());
//Body parser JSON
app.use(express.json());
//URL encoded parser
app.use(express.urlencoded({ extended: true }));

// Middleware to log Request
app.use(logRequest)

const port = process.env.PORT ?? 8000;

app.get("/health", (req: Request, res: Response) => {
  res.send("SelfieBE is alive!");
});

app.get("/users/:userid", jwtMiddleWare, getUserCallback);

app.get("/activate", activateUserCallback);

app.delete("/users/:userid", jwtMiddleWare, deleteUserCallback);

app.post("/register", registerCallback);

app.post("/login", loginCallback);

app.patch("/reset-password", resetPasswordCallback);

app.put(
  "/users/:userid/profile-picture",
  jwtMiddleWare,
  multerMiddleware.single("file"),
  profilePictureUploadMiddleware
);

app.get(
  "/users/:userid/profile-picture",
  jwtMiddleWare,
  getProfilePictureCallback
);

//NOTES
app.get("/users/:userid/notes", jwtMiddleWare, getNotesCallback);
app.put("/users/:userid/notes", jwtMiddleWare, putNotesCallback);
app.delete("/users/:userid/notes/:noteid", jwtMiddleWare, deleteNotesCallback);
app.patch("/users/:userid/notes/:folderid/:noteid", jwtMiddleWare, moveNotesCallback);
app.patch("/users/:userid/notes/:noteid", jwtMiddleWare, saveNoteCallback)

//recent notes
app.get("/users/:userid/notes/recent", jwtMiddleWare, getRecentNotesCallback);
app.post("/users/:userid/notes/recent", jwtMiddleWare, postRecentNotesCallback);

//POMODORO
app.get("/users/:userid/pomodoro/pomodoroinfo/:pomodoroid", jwtMiddleWare, getPomodoroCallback );
app.put("/users/:userid/pomodoro/pomodoroinfo", jwtMiddleWare, postPomodoroCallback);
app.get("/users/:userid/pomodoro/studyplan", jwtMiddleWare, getStudyPlanCallback);
app.put("/users/:userid/pomodoro/studyplan", jwtMiddleWare, putStudyPlanCallback);
app.delete("/users/:userid/pomodoro/studyplan/:planid", jwtMiddleWare, deleteStudyPlanCallback);

//sessioni passate
app.get(
  "/users/:userid/pomodoro/oldSessions",
  jwtMiddleWare,
  getStudySessionsCallback
);
app.put(
  "/users/:userid/pomodoro/oldSessions",
  jwtMiddleWare,
  putStudySessionsCallback
);
app.delete(
  "/users/:userid/pomodoro/oldSessions/:sessionid",
  jwtMiddleWare,
  deleteStudySessionsCallback
);

//tasks
app.get("/users/:userid/pomodoro/tasks", jwtMiddleWare, getTasksCallback);
app.post("/users/:userid/pomodoro/tasks", jwtMiddleWare, postTasksCallback);
app.put("/users/:userid/pomodoro/tasks", jwtMiddleWare, putTasksCallback);
app.delete(
  "/users/:userid/pomodoro/tasks/:taskid",
  jwtMiddleWare,
  deleteTasksCallback
);

//EVENTS
app.get("/users/:userid/events", jwtMiddleWare, getEventsCallback);
app.get("/users/:userid/events/today", jwtMiddleWare, getEventsCallback);
app.post("/users/:userid/events", jwtMiddleWare, postEventsCallback);
app.put("/users/:userid/events/:eventid", jwtMiddleWare, putEventsCallback);
app.delete(
  "/users/:userid/events/:eventid",
  jwtMiddleWare,
  deleteEventsCallback
);

//project
app.post("/users/:userid/project", jwtMiddleWare, saveProjectCallback);
app.post(
  "/users/:userid/project/search",
  jwtMiddleWare,
  filterProjectsCallback
);
app.patch("/users/:userid/project/task", jwtMiddleWare, addProjectTaskCallback);
app.patch("/users/:userid/project", jwtMiddleWare, updateProjectCallback);
app.get("/users/:userid/project", jwtMiddleWare, fetchProjectsCallback);
app.delete(
  "/users/:userid/project/:projectid",
  jwtMiddleWare,
  deleteProjectCallback
);

//SUGGEST
app.post("/users/:userid/search", jwtMiddleWare, autoSuggestUsersCallback);

app.get("/time", getToday)
app.post("/time", setToday)
app.post("/time/reset", resetToday)

// Middleware to catch every unhandled error
app.use(errorHandler);

const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

checkDbConnection().then((it) => {
  if (!it) {
    throw new Error("MongoDB connection refused");
  }

  //TODO generate all the email templates
  templateManager.initTemplateAsync()
  
  
  app.listen(port, () => {
    console.log(`[server]: Server is running at ${port}`);
  });
});
