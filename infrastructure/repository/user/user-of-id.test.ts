import { User } from '@apps/backend/entity/user';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { userOfIdRepository } from './user-of-id';

describe('UserOfId', () => {
  let user: User | undefined;
  let send: DynamoDBDocumentClient['send'];

  describe('正常系', () => {
    beforeEach(async () => {
      const ddbDocClient = {} as DynamoDBDocumentClient;
      send = jest.fn().mockResolvedValue({
        Item: { userId: 'DummyUser' },
      });
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
