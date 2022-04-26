import { User } from '@apps/backend/src/entity/user';
import {
  DynamoDBDocumentClient,
  GetCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { userOfIdRepository } from './user-of-id';

const dummyOutputSuccess = {} as GetCommandOutput;
dummyOutputSuccess.Item = { userId: 'DummyUser' };

describe('UserOfId', () => {
  let user: User | undefined;
  const send = jest.fn();

  describe('正常系', () => {
    beforeEach(async () => {
      const ddbDocClient = {} as DynamoDBDocumentClient;
      send.mockResolvedValue(dummyOutputSuccess);
      ddbDocClient.send = send;
      const userOfId = userOfIdRepository({
        userTableName: 'UserTable',
        ddbDocClient,
      });
      user = await userOfId('DummyUser');
    });

    test('ユーザー情報が返却されること', () => {
      expect(user).not.toBeUndefined();
    });

    test('ddbDocClient.sendがコールされること', () => {
      expect(send).toBeCalled();
    });
  });
});
