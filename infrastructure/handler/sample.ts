import {
  ACommand,
  AnOutput,
  applicationService,
} from '@apps/backend/service/sample';
import { BusinessError } from '@libs/sup'; // FIXME
import {
  ErrorHttpStatusCode,
  FailureHttpStatusCode,
  FailureResponse,
  proxyHandler,
  responseBody,
  ServiceCommand,
  SuccessHttpStatusCode,
  SuccessResponse,
  UnknownErrorResponse,
} from '@libs/sup/aws-lambda';

const serviceCommand: ServiceCommand<ACommand> = (event) => ({
  id: parseInt(event.pathParameters?.['userId'] || '', 10),
});

const serviceOutput = applicationService();

const failureResponse: FailureResponse<BusinessError> = (error) => ({
  statusCode: FailureHttpStatusCode.BAD_REQUEST,
  body: responseBody<BusinessError>(error),
});

const successResponse: SuccessResponse<AnOutput> = (anOutput) => ({
  statusCode: SuccessHttpStatusCode.OK,
  body: responseBody<AnOutput>(anOutput),
});

interface InternalServerErrorResponseBody {
  message: string;
}

const unknownErrorResponse: UnknownErrorResponse = () => ({
  statusCode: ErrorHttpStatusCode.INTERNAL_SERVER_ERROR,
  body: responseBody<InternalServerErrorResponseBody>({
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
