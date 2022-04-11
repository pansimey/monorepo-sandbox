import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { service } from '@monorepo-sandbox/backend/service/sample';

export const handler: APIGatewayProxyHandler = async () => {
  await Promise.resolve();
  return {
    statusCode: service(),
    body: '',
  };
};
