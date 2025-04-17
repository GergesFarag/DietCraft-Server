import jwt from "jsonwebtoken";
import { User } from "../models/Iuser.model";
import { Request, Response, NextFunction } from "express";
import { catchError } from "../utils/catchError";
import { CustomError } from "../utils/error.handler";
import { HttpStatus } from "../utils/HttpStatus";
const verifyAccessToken = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization
        : null;
    if (!token) {
      return next(
        new CustomError(
          "Unauthorized",
          "Token is required",
          HttpStatus.UNAUTHORIZED
        )
      );
    }
    const accessToken = token!.split(" ")[1];
    jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
      (err, decoded) => {
        if (err) {
          return next(
            new CustomError(
              "Unauthorized",
              "Token is required",
              HttpStatus.UNAUTHORIZED
            )
          );
        }
        //@ts-ignore
        req.data = decoded;
        next();
      }
    );
  }
);
const verifyRefreshToken = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(
        new CustomError(
          "Unauthorized",
          "Token is required",
          HttpStatus.UNAUTHORIZED
        )
      );
    }
    jwt.verify(
      token,
      process.env.REFRESH_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(
            new CustomError(
              "Unauthorized",
              "Token is required",
              HttpStatus.UNAUTHORIZED
            )
          );
        }
        // @ts-ignore
        req.data = decoded.id;
        next();
      }
    );
  }
);
const isAdmin = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = await User.findById(req.data.id);
    if (!user) {
      return next(
        new CustomError(
          "Bad Request",
          "User Not Found",
          HttpStatus.BAD_REQUEST
        )
      );
    }
    if (!user.isAdmin) {
      return next(
        new CustomError(
          "Unauthorized",
          "Unauthorized Access",
          HttpStatus.UNAUTHORIZED
        )
      );
      return;
    }
    next();
  }
);
export const authMiddle = { verifyAccessToken, verifyRefreshToken, isAdmin };
