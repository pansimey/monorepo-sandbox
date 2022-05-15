import { ApplicationService, Result, ResultType } from '@libs/sup/src';
import { InvalidUserId } from '../business-error/invalid-user-id';
import { UserNotFound } from '../business-error/user-not-found';
import type { User } from '../entity/user';
import type { UserOfId } from '../repository/user';

export interface ShowUserCommand {
  userId: string;
}

export type ShowUserFailure = InvalidUserId | UserNotFound;

interface Registry {
  userOfId: UserOfId;
}

export type ShowUserResult = Result<ShowUserFailure, User>;

export const applicationService: ApplicationService<
  Registry,
  ShowUserCommand,
  ShowUserResult
> = ({ userOfId }) => {
  return async ({ userId }) => {
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
};
