import { HttpStatus } from "./httpStatus";

export class ValidationError extends Error {
  status: HttpStatus;
  errorCode: string;
  details: string;

  constructor(
    status: HttpStatus,
    errorCode: string,
    message: string,
    details: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }

  format(): object {
    return {
      status: this.status,
      errorCode: this.errorCode,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

export function isErrorWithResponse(error: unknown): error is {
  response: {
    status: number;
    data: {
      status: number;
      errorCode: string;
      message: string;
      details: string;
      timestamp: string;
    };
  };
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: any }).response === 'object' &&
    (error as { response: { status: number } }).response !== null &&
    'status' in (error as { response: any }).response &&
    'data' in (error as { response: any }).response &&
    typeof (error as { response: { data: any } }).response.data === 'object' &&
    'status' in (error as { response: { data: any } }).response.data &&
    'errorCode' in (error as { response: { data: any } }).response.data &&
    'message' in (error as { response: { data: any } }).response.data &&
    'details' in (error as { response: { data: any } }).response.data &&
    'timestamp' in (error as { response: { data: any } }).response.data
  );
}

export function isErrorWithResponseV2(error: unknown): error is {
  response: {
    status: number;
    data: {
      error: string;
      message: string;
      validation: string;
    };
  };
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: any }).response === 'object' &&
    (error as { response: { status: number } }).response !== null &&
    'status' in (error as { response: any }).response &&
    'data' in (error as { response: any }).response &&
    typeof (error as { response: { data: any } }).response.data === 'object' &&
    'error' in (error as { response: { data: any } }).response.data &&
    'message' in (error as { response: { data: any } }).response.data &&
    'validation' in (error as { response: { data: any } }).response.data
  );
}

export function handleError(error: unknown, context: string): ValidationError {
  let status = HttpStatus.InternalError;
  let errorCode = '00000000000';
  let message =
    'An unexpected error occurred. Please contact support or try again later.';
  let details = '';

  if (isErrorWithResponse(error)) {
    status = error.response?.status || HttpStatus.InternalError;
    if (error.response?.data) {
      const errData = error.response.data;
      errorCode = errData.errorCode || errorCode;
      message = errData.message || message;
      details = errData.details || JSON.stringify(errData);
    }
  } else if (isErrorWithResponseV2(error)) {
    status = error.response?.status || HttpStatus.InternalError;
    const errData = error.response.data;
    message = errData.message || message;
    details = errData.validation || JSON.stringify(errData);
  } else if (error instanceof Error) {
    message = error.message;
    details = error.stack || '';
  }

  const validationError = new ValidationError(
    status,
    errorCode,
    message,
    details
  );

  const logPrefix = `[Error - API ${context}]`;
  console.error(
    `${logPrefix} ${JSON.stringify(validationError.format(), null, 2)}`
  );

  return validationError;
}
