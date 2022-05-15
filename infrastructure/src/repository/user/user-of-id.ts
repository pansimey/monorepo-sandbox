import type { UserOfId } from '@apps/backend/src/repository/user';
import type { DynamoDB } from 'aws-sdk';

interface UserOfIdDependency {
  userTableName: string;
  ddbDocClient: DynamoDB.DocumentClient;
}

interface UserOfIdRepository {
  (dependency: UserOfIdDependency): UserOfId;
}

export const userOfIdRepository: UserOfIdRepository = ({
  userTableName,
  ddbDocClient,
}) => {
  return async (userId) => {
    const request = ddbDocClient.get({
      TableName: userTableName,
      Key: { userId },
    });
    const { Item: item } = await request.promise();
    if (!item) {
      return;
    }
    const itemUserId: unknown = item['userId'];
    if (typeof itemUserId !== 'string') {
      throw new Error('UserTable: item.userId is not a `string`');
    }
    return {
      userId: itemUserId,
    };
  };
};
