import CustomError from "../classes/error";
import { STATUS } from "./constant";

export const notAuthorized = () => {
  const error = new CustomError("Not Authorized");
  error.statusCode = STATUS.NOT_AUTHORIZED;

  return error;
};

export const badReq = (mesaage: string, status: number) => {
  const error = new CustomError(mesaage);
  error.statusCode = status;

  return error;
};
