export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export const createError = (
  error: string,
  message: string,
  details?: unknown
): ApiError => {
  return details === undefined ? { error, message } : { error, message, details };
};
