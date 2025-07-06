// Local purposes
require("dotenv").config();

import {checkDbConnection} from "./repositories/repository";
import express, {
  Express,
  Request,
  Response,
} from "express";
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
  postNotesCallback,
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
  getStudySessionsCallback,
  postStudySessionsCallback,
  deleteStudySessionsCallback,
  deleteTasksCallback,
  saveProjectCallback,
  fetchProjectsCallback,
  deleteProjectCallback,
  filterProjectsCallback,
  autoSuggestUsersCallback, updateProjectCallback, addProjectTaskCallback
} from "./callbacks/endpoints";
import { errorHandler, jwtMiddleWare, logRequest } from "./callbacks/mddleware";
import multer from "multer";

const app: Express = express();

const multerMiddleware = multer();


//Enable CORS (Cross ORigin Site)
app.use(cors());
//Body parser JSON
app.use(express.json());
//URL encoded parser
app.use(express.urlencoded({ extended: true }));

// Middleware to log Request
app.use(logRequest);

const port = process.env.PORT ?? 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("SelfieBE is alive!");
});

app.get("/users/:userid", jwtMiddleWare, getUserCallback);

app.get("/activate", activateUserCallback);

app.delete("/users/:userid", jwtMiddleWare, deleteUserCallback);

app.post("/register", registerCallback);

app.post("/login", loginCallback);

app.patch("/reset-password", resetPasswordCallback);

app.put('/users/:userid/profile-picture', jwtMiddleWare, multerMiddleware.single('file'), profilePictureUploadMiddleware)

app.get('/users/:userid/profile-picture', jwtMiddleWare, getProfilePictureCallback)

//NOTES
app.get('/users/:userid/notes', jwtMiddleWare, getNotesCallback);
app.post('/users/:userid/notes', jwtMiddleWare, postNotesCallback);
app.delete('/users/:userid/notes', jwtMiddleWare, postNotesCallback);

//recent notes
app.get('/users/:userid/notes/recent', jwtMiddleWare, getRecentNotesCallback);
app.post('/users/:userid/notes/recent', jwtMiddleWare, postRecentNotesCallback);

//POMODORO
app.get('/users/:userid/pomodoro', jwtMiddleWare, getPomodoroCallback);
app.put('/users/:userid/pomodoro', jwtMiddleWare, postPomodoroCallback);

//sessioni passate
app.get('/users/:userid/pomodoro/oldSessions', jwtMiddleWare, getStudySessionsCallback);
app.post('/users/:userid/pomodoro/oldSessions', jwtMiddleWare, postStudySessionsCallback);
app.delete('/users/:userid/pomodoro/oldSessions/:sessionid', jwtMiddleWare, deleteStudySessionsCallback);

//tasks
app.get('/users/:userid/pomodoro/tasks', jwtMiddleWare, getTasksCallback);
app.post('/users/:userid/pomodoro/tasks', jwtMiddleWare, postTasksCallback);
app.delete('/users/:userid/pomodoro/tasks/:taskid', jwtMiddleWare, deleteTasksCallback);

//EVENTS
app.get('/users/:userid/events', jwtMiddleWare, getEventsCallback)
app.post('/users/:userid/events', jwtMiddleWare, postEventsCallback)
app.put('/users/:userid/events/:eventid', jwtMiddleWare, putEventsCallback)
app.delete('/users/:userid/events/:eventid', jwtMiddleWare, deleteEventsCallback)

//project
app.post('/users/:userid/project', jwtMiddleWare,saveProjectCallback);
app.post('/users/:userid/project/search', jwtMiddleWare, filterProjectsCallback)
app.patch('/users/:userid/project/task', jwtMiddleWare, addProjectTaskCallback)
app.patch('/users/:userid/project', jwtMiddleWare, updateProjectCallback)
app.get('/users/:userid/project', jwtMiddleWare ,fetchProjectsCallback);
app.delete('/users/:userid/project/:projectid', jwtMiddleWare, deleteProjectCallback)

//SUGGEST
app.post('/users/:userid/search', jwtMiddleWare, autoSuggestUsersCallback)


// Middleware to catch every unhandled error
app.use(errorHandler);

checkDbConnection().then(it => {
  if(!it){
    throw new Error("MongoDB connection refused");
  }

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  })

})


