import { Error } from "mongoose";

class CustomError extends Error {
  statusCode: number;
  data: object | string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export default CustomError;
