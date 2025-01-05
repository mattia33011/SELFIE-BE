import { ErrorRequestHandler, RequestHandler } from "express";
import pino from "pino";
import { getSelfieError } from "../types/error";
import jwtManager from "../managers/jwtManager";
import { SelfieError } from "../types/error";

const logger = pino();

// Middleware handle error
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SelfieError) {
    logger.error(
      `Error: ${JSON.stringify(err.error)} - Status: ${err.status} - Request: ${
        req.originalUrl
      }`
    );
    res.status(err.status).json(err);
  } else {
    console.log(JSON.stringify(err));
    logger.error(
      err,
      `INTERNAL SERVER ERROR - Status: 500 - Request: ${req.originalUrl}`
    );
    res
      .status(500)
      .json(
        getSelfieError("INTERNAL_SERVER_ERROR", 500, "INTERNAL SERVER ERROR")
      );
  }
};

export const logRequest: RequestHandler = (req, res, next) => {
  // Esegui qualsiasi operazione prima di passare al prossimo middleware
  const logRequ = () => {
    if (res.statusCode == 200)
      logger.info(`Request ${req.originalUrl} handled`);
  };
  res.on("finish", logRequ);
  next();
};

// JWT auth handler
export const jwtMiddleWare: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization;
  const error = getSelfieError(
    "NO_AUTH",
    401,
    "The subject is not the requester"
  );
  if (!token || jwtManager.isExpired(token.substring(7))) {
    logger.error(`JWT expired - Request: ${req.originalUrl}`);
    res.status(401).json(error);
    return;
  }
  const decodedToken = jwtManager.decodeToken(
    req.headers.authorization!.substring(7)
  );
  if (
    req.params.userid &&
    decodedToken?.email != req.params.userid &&
    decodedToken?.username != req.params.userid
  ) {
    logger.error(
      `User ${decodedToken?.email} is not authorized - Request: ${req.originalUrl}`
    );
    res.status(401).json(error);
    return;
  }

  req.body = { ...req.body, _userSession: decodedToken };
  next();
};
