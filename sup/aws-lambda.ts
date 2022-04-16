import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import 'source-map-support/register';
import {
  BusinessError,
  Failure,
  logger,
  Result,
  ResultType,
  ServiceOutput,
} from '@libs/sup';

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

const isFailure = <E extends BusinessError, T>(
  result: Result<E, T>
): result is Failure<E> => result.resultType === ResultType.FAILURE;

export const responseBody = <T>(response: T): string =>
  JSON.stringify(response);

export interface ServiceCommand<T> {
  (event: APIGatewayProxyEvent): T;
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
  serviceOutput: ServiceOutput<T, E, U>;
  failureResponse: FailureResponse<E>;
  successResponse: SuccessResponse<U>;
  unknownErrorResponse: UnknownErrorResponse;
}

export const proxyHandler =
  <T, E extends BusinessError, U>({
    serviceCommand,
    serviceOutput,
    failureResponse,
    successResponse,
    unknownErrorResponse,
  }: ProxyHandlerProps<T, E, U>): APIGatewayProxyHandler =>
  async (event) => {
    try {
      const result = await serviceOutput(serviceCommand(event));
      if (isFailure(result)) {
        logger.warn(result.resultValue);
        return failureResponse(result.resultValue);
      }
      return successResponse(result.resultValue);
    } catch (error) {
      logger.error(error);
      return unknownErrorResponse(error);
    }
  };
