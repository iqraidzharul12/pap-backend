import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the head
  const bearerToken = <string>req.headers.authorization;
  let token = ""
  if (bearerToken) token = bearerToken.split(" ")[1];
  let jwtPayload;

  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecret);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send({
      error: true,
      errorList: ["unauthorized"],
      data: null,
    });
    return;
  }

  //The token is valid for 1 hour
  //We want to send a new token on every request
  const { userId, email, role } = jwtPayload;
  const newToken = jwt.sign(
    { userId, email, role },
    config.jwtSecret,
    // { expiresIn: "30d" }
  );
  res.setHeader("token", newToken);

  //Call the next middleware or controller
  next();
};
