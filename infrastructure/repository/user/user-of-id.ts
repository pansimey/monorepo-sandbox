import { UserOfId } from '@apps/backend/repository/user';

export const userOfId: UserOfId = async (userId) => {
  return await Promise.resolve({ userId });
};
