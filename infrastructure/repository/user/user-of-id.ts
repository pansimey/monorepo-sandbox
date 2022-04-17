import { User } from '@apps/backend/entity/user';
import { UserOfId } from '@apps/backend/repository/user';

export const userOfId: UserOfId = async (userId) =>
  await Promise.resolve<User>({ userId });
