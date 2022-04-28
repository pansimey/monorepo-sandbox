import { User } from '@apps/backend/src/entity/user';
import { DynamoDB, Request, AWSError } from 'aws-sdk';
import { userOfIdRepository } from './user-of-id';

const dummyOutputSuccess = {} as DynamoDB.DocumentClient.GetItemOutput;
dummyOutputSuccess.Item = { userId: 'DummyUser' };

describe('UserOfId', () => {
  let user: User | undefined;
  const request = {} as Request<
    DynamoDB.DocumentClient.GetItemOutput,
    AWSError
  >;
  const get = jest.fn();
  const promise = jest.fn();

  describe('正常系', () => {
    beforeEach(async () => {
      const ddbDocClient = {} as DynamoDB.DocumentClient;
      promise.mockResolvedValue(dummyOutputSuccess);
      request.promise = promise;
      get.mockReturnValue(request);
      ddbDocClient.get = get;
      const userOfId = userOfIdRepository({
        userTableName: 'UserTable',
        ddbDocClient,
      });
      user = await userOfId('DummyUser');
    });

    test('ユーザー情報が返却されること', () => {
      expect(user).not.toBeUndefined();
    });

    test('DynamoDB.DocumentClient.get()がコールされること', () => {
      expect(get).toBeCalled();
    });

    test('Request.promise()がコールされること', () => {
      expect(promise).toBeCalled();
    });
  });
});
