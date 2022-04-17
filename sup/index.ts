import { Readable } from 'stream';

export class BusinessError extends Error {
  type = 'BusinessError' as const;

  toJSON() {
    return {
      type: this.type,
      name: this.name,
      message: this.message,
      stack: this.stack?.split('\n'),
    };
  }
}

export const ResultType = {
  FAILURE: 'Failure',
  SUCCESS: 'Success',
} as const;

type ResultType = typeof ResultType[keyof typeof ResultType];

interface Failure<E extends BusinessError> {
  resultType: typeof ResultType.FAILURE;
  resultValue: E;
}

interface Success<T> {
  resultType: typeof ResultType.SUCCESS;
  resultValue: T;
}

export type Result<E extends BusinessError, T> = Failure<E> | Success<T>;

export const isFailure = <E extends BusinessError, T>(
  result: Result<E, T>
): result is Failure<E> => result.resultType === ResultType.FAILURE;

export const isSuccess = <E extends BusinessError, T>(
  result: Result<E, T>
): result is Success<T> => result.resultType === ResultType.SUCCESS;

export interface ServiceOutput<T, U> {
  (command: T): Promise<U>;
}

export interface ApplicationService<T, U, V> {
  (registry: T): ServiceOutput<U, V>;
}

const NODE_ENV = process.env['NODE_ENV'];
const PRODUCTION = 'production' as const;
const END = 'end' as const;
const LF = '\n' as const;
const UNKNOWN_ERROR = 'UnknownError' as const;
const stdoutLineFeed = () => process.stdout.write(LF);
const stderrLineFeed = () => process.stderr.write(LF);
const errorToJson = (error: unknown) => {
  const unknownError =
    error instanceof Error
      ? {
          ...error,
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n'),
        }
      : error;
  return {
    type: UNKNOWN_ERROR,
    error: unknownError,
  };
};

export const logger = {
  debug: <T>(message: T): void => {
    if (NODE_ENV === PRODUCTION) {
      return;
    }
    const readable = Readable.from(JSON.stringify(message));
    readable.on(END, stdoutLineFeed);
    readable.pipe(process.stdout);
  },
  info: <T>(message: T): void => {
    const readable = Readable.from(JSON.stringify(message));
    readable.on(END, stdoutLineFeed);
    readable.pipe(process.stdout);
  },
  warn: <E extends BusinessError>(error: E): void => {
    const readable = Readable.from(JSON.stringify(error));
    readable.on(END, stderrLineFeed);
    readable.pipe(process.stderr);
  },
  error: (error: unknown): void => {
    const readable = Readable.from(JSON.stringify(errorToJson(error)));
    readable.on(END, stderrLineFeed);
    readable.pipe(process.stderr);
  },
};
