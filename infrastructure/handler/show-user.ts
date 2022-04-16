import {
  applicationService,
  ShowUserCommand,
  ShowUserException,
} from '@apps/backend/application-service/show-user';
import { User } from '@apps/backend/entity/user';
import { UserOfId } from '@apps/backend/repository/user'; // FIXME
import {
  ErrorHttpStatusCode,
  FailureHttpStatusCode,
  FailureResponse,
  leftover,
  proxyHandler,
  responseBody,
  ServiceCommand,
  SuccessHttpStatusCode,
  SuccessResponse,
  UnknownErrorResponse,
} from '@libs/sup/aws-lambda';

const serviceCommand: ServiceCommand<ShowUserCommand> = (event) => ({
  userId: event.pathParameters?.['userId'] || '',
});

// FIXME
const userOfId: UserOfId = async (userId) => {
  return await Promise.resolve({ userId });
};

const serviceOutput = applicationService({
  userOfId,
});

interface ErrorResponseBody {
  message: string;
}

const failureResponse: FailureResponse<ShowUserException> = (error) => {
  switch (error.name) {
    case 'InvalidUserId':
      return {
        statusCode: FailureHttpStatusCode.BAD_REQUEST,
        body: responseBody<ErrorResponseBody>({
          message: error.message,
        }),
      };
    case 'UserNotFound':
      return {
        statusCode: FailureHttpStatusCode.NOT_FOUND,
        body: responseBody<ErrorResponseBody>({
          message: error.message,
        }),
      };
    default:
      return leftover(error);
  }
};

const successResponse: SuccessResponse<User> = (user) => ({
  statusCode: SuccessHttpStatusCode.OK,
  body: responseBody<User>(user),
});

const unknownErrorResponse: UnknownErrorResponse = () => ({
  statusCode: ErrorHttpStatusCode.INTERNAL_SERVER_ERROR,
  body: responseBody<ErrorResponseBody>({
    message: 'Unknown Error',
  }),
});

export const handler = proxyHandler({
  serviceCommand,
  serviceOutput,
  failureResponse,
  successResponse,
  unknownErrorResponse,
});
