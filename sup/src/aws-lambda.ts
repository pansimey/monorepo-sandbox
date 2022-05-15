import 'source-map-support/register';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import {
  BusinessError,
  isFailure,
  buildLogger,
  Result,
  ServiceOutput,
} from '@libs/sup/src';

export const SuccessHttpStatusCode = {
  OK: 200,
  CREATED: 201,
} as const;

export const FailureHttpStatusCode = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
} as const;

export const ErrorHttpStatusCode = {
  INTERNAL_SERVER_ERROR: 500,
} as const;

type SuccessHttpStatusCode =
  typeof SuccessHttpStatusCode[keyof typeof SuccessHttpStatusCode];
type FailureHttpStatusCode =
  typeof FailureHttpStatusCode[keyof typeof FailureHttpStatusCode];
type ErrorHttpStatusCode =
  typeof ErrorHttpStatusCode[keyof typeof ErrorHttpStatusCode];

interface SuccessHttpResponse extends APIGatewayProxyResult {
  statusCode: SuccessHttpStatusCode;
}

interface FailureHttpResponse extends APIGatewayProxyResult {
  statusCode: FailureHttpStatusCode;
}

interface ErrorHttpResponse extends APIGatewayProxyResult {
  statusCode: ErrorHttpStatusCode;
}

export const responseBody = <T>(response: T): string => {
  return JSON.stringify(response);
};

interface DefinedJson<T> {
  toJSON?: () => T;
}

export interface ServiceCommand<T> {
  (event: APIGatewayProxyEvent): T & DefinedJson<T>;
}

export interface FailureResponse<E extends BusinessError> {
  (failure: E): FailureHttpResponse;
}

export interface SuccessResponse<T> {
  (success: T): SuccessHttpResponse;
}

export interface UnknownErrorResponse {
  (error: unknown): ErrorHttpResponse;
}

export const leftover = (error: never): never => error;

interface ProxyHandlerProps<T, E extends BusinessError, U> {
  serviceCommand: ServiceCommand<T>;
  serviceOutput: ServiceOutput<T, Result<E, U>>;
  failureResponse: FailureResponse<E>;
  successResponse: SuccessResponse<U>;
  unknownErrorResponse: UnknownErrorResponse;
}

interface ProxyHandler {
  <T, E extends BusinessError, U>(
    props: ProxyHandlerProps<T, E, U>
  ): APIGatewayProxyHandler;
}

export const proxyHandler: ProxyHandler = ({
  serviceCommand,
  serviceOutput,
  failureResponse,
  successResponse,
  unknownErrorResponse,
}) => {
  const logger = buildLogger();
  return async (event) => {
    try {
      const command = serviceCommand(event);
      logger.info(command);
      const result = await serviceOutput(command);
      if (isFailure(result)) {
        logger.warn(result.resultValue);
        return failureResponse(result.resultValue);
      }
      logger.info(result.resultValue);
      return successResponse(result.resultValue);
    } catch (error) {
      logger.error(error);
      return unknownErrorResponse(error);
    }
  };
};
