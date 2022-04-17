import { ApplicationService, Result, ResultType } from '@libs/sup';
import { InvalidUserId } from '../business-error/invalid-user-id';
import { UserNotFound } from '../business-error/user-not-found';
import { User } from '../entity/user';
import { UserOfId } from '../repository/user';

export interface ShowUser {
  userId: string;
}

export type ShowUserFailure = InvalidUserId | UserNotFound;

interface Registry {
  userOfId: UserOfId;
}

export type ShowUserResult = Result<ShowUserFailure, User>;

export const applicationService: ApplicationService<
  Registry,
  ShowUser,
  ShowUserResult
> =
  ({ userOfId }) =>
  async ({ userId }) => {
    if (userId.length === 0) {
      return {
        resultType: ResultType.FAILURE,
        resultValue: new InvalidUserId(),
      };
    }
    const user = await userOfId(userId);
    if (!user) {
      return {
        resultType: ResultType.FAILURE,
        resultValue: new UserNotFound(),
      };
    }
    return {
      resultType: ResultType.SUCCESS,
      resultValue: user,
    };
  };
