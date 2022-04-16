import {
  applicationService,
  ShowUser,
  ShowUserFailure,
} from '@apps/backend/application-service/show-user';
import { User } from '@apps/backend/entity/user';
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
import { userOfId } from '../repository/user/user-of-id';

const serviceCommand: ServiceCommand<ShowUser> = (event) => ({
  userId: event.pathParameters?.['userId'] || '',
});

const serviceOutput = applicationService({
  userOfId,
});

interface ErrorResponseBody {
  message: string;
}

const failureResponse: FailureResponse<ShowUserFailure> = (error) => {
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

interface OkResponseBody {
  userId: string;
}

const successResponse: SuccessResponse<User> = (user) => ({
  statusCode: SuccessHttpStatusCode.OK,
  body: responseBody<OkResponseBody>({
    userId: user.userId,
  }),
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
