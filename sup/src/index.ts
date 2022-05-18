import { Readable } from 'stream';
import type { WriteStream } from 'tty';

interface BusinessErrorJson {
  type: 'BusinessError';
  name: string;
  message: string;
  stack: string[] | undefined;
}

export class BusinessError extends Error {
  type = 'BusinessError' as const;

  toJSON(): BusinessErrorJson {
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

interface UnknownErrorJson {
  type: 'UnknownError';
  name?: string;
  message?: string;
  stack?: string[] | undefined;
  error: unknown;
}

const errorToJson = (error: unknown): UnknownErrorJson => {
  if (error instanceof Error) {
    return {
      type: UNKNOWN_ERROR,
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n'),
      error,
    };
  }
  return {
    type: UNKNOWN_ERROR,
    error,
  };
};

interface BuildLoggerProps {
  out?: WriteStream;
  err?: WriteStream;
}

export interface Logger {
  debug: <T>(message: T) => void;
  info: <T>(message: T) => void;
  warn: <E extends BusinessError>(error: Failure<E>) => void;
  error: (error: unknown) => void;
}

interface BuildLogger {
  (props?: BuildLoggerProps): Logger;
}

export const buildLogger: BuildLogger = (props) => {
  const wsout = props?.out || process.stdout;
  const wserr = props?.err || process.stderr;
  const outLineFeed = () => wsout.write(LF);
  const errLineFeed = () => wserr.write(LF);
  return {
    debug: (message: unknown): void => {
      if (NODE_ENV === PRODUCTION) {
        return;
      }
      const readable = Readable.from(JSON.stringify(message));
      readable.on(END, outLineFeed);
      readable.pipe(wsout);
    },
    info: (message: unknown): void => {
      const readable = Readable.from(JSON.stringify(message));
      readable.on(END, outLineFeed);
      readable.pipe(wsout);
    },
    warn: <E extends BusinessError>(result: Failure<E>): void => {
      const readable = Readable.from(JSON.stringify(result));
      readable.on(END, errLineFeed);
      readable.pipe(wserr);
    },
    error: (error: unknown): void => {
      const readable = Readable.from(JSON.stringify(errorToJson(error)));
      readable.on(END, errLineFeed);
      readable.pipe(wserr);
    },
  };
};
