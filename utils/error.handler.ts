import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "./HttpStatus";
// * Custom Error Class To Enhance Readability Of Code
export class CustomError extends Error{
  constructor(public name:string, public message:string , public status:number){
    super(message);
  }
}
export default class ErrorsHandler {
  static notFound(req: Request, res: Response, next: NextFunction) {
    res.status(HttpStatus.NOT_FOUND).json({ message: "Not Found Route For " + req.originalUrl });
  }
  static errorHandle(
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log("ERROR FROM => " , err.stack);
    res.status(err.status).json({ err: err.name, message: err.message });
  }
}
