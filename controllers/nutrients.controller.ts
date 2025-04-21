import { NextFunction, Request, Response } from "express";
import { catchError } from "../utils/catchError";
import { CustomError } from "../utils/error.handler";
import { HttpStatus } from "../utils/HttpStatus";
import { apiFetch } from "../utils/apiFetch";
const API = process.env.NUTRIENTS_API as string;
const getNutrients = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { item } = req.query;
    if (!item) {
      return next(
        new CustomError(
          "Invalid Data",
          "Please provide a food item",
          HttpStatus.BAD_REQUEST
        )
      );
    }
    const data = await apiFetch(`${API}query=${item}`, {
      "X-Api-Key": process.env.API_KEY as string,
    }, "GET");
    if (data.items.length === 0) {
      res.status(200).json({
        message: `${item} not found`,
        data: null
      })
    }
    res.status(200).json({
      message: `${item} nutrients got successfully `,
      data:{...data.items[0]},
    });
  }
);
export const nutrientsController = {
  getNutrients,
};
