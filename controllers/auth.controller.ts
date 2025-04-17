import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { catchError } from "../utils/catchError";
import { User } from "../models/Iuser.model";
export const generateTokens = (data: any, isJWT: boolean) => {
  let token = "";
  if (isJWT) { 
    token = jwt.sign(
        { id: data.id, role: data.isAdmin },
        process.env.JWT_SECRET as string,
        { expiresIn: "2h" }
    );
} else { 
    token = jwt.sign( 
      { id: data.id, role: data.isAdmin },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );
  }
  return token;
};
export const updateAccessToken = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(400).json({ message: "You're Not Logged In , Please Login " });
      return;
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string,
      async (err: any, decoded: any) => {
        if (err) {
          res.status(400).json({ message: "Invalid Token" });
          return;
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(400).json({ message: "Refresh Token is Not Valid" });
            return;
        }
        const newAccessToken = generateTokens(decoded, true);
        res.status(200).json({
          message: "New Access Token Generated Successfully !",
          data: { accessToken: newAccessToken, role: user.isAdmin },
        });
      }
    );
  }
);