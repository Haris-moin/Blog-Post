export interface CustomError extends Error {
  statusCode: number;
  data?: string;
}
