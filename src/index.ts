// Local purposes
require("dotenv").config();

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
} from "./callbacks/endpoints";
import { errorHandler, jwtMiddleWare, logRequest } from "./callbacks/mddleware";
import fileManager from "./managers/fileManager";

const app: Express = express();

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

app.put('/users/:userid/profile-picture', jwtMiddleWare, fileManager.uploadMiddleware.single('file'), profilePictureUploadMiddleware)

app.get('/users/:userid/profile-picture', jwtMiddleWare, getProfilePictureCallback)

// Middleware to catch every unhandled error
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost${port}`);
});
