import { UserOfId } from '@apps/backend/repository/user';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

interface UserOfIdDependency {
  userTableName: string;
  ddbDocClient: DynamoDBDocumentClient;
}

interface UserOfIdRepository {
  (dependency: UserOfIdDependency): UserOfId;
}

export const userOfIdRepository: UserOfIdRepository =
  ({ userTableName, ddbDocClient }) =>
  async (userId) => {
    const command = new GetCommand({
      TableName: userTableName,
      Key: { userId },
    });
    const { Item: item } = await ddbDocClient.send(command);
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
