import { ApplicationService, BusinessError, ResultType } from '@libs/sup';
import { User } from '../entity/user';
import { UserOfId } from '../repository/user';

export interface ShowUserCommand {
  userId: string;
}

class InvalidUserId extends BusinessError {
  override name = 'InvalidUserId' as const;

  constructor() {
    super('Invalid User ID');
  }
}

class UserNotFound extends BusinessError {
  override name = 'UserNotFound' as const;

  constructor() {
    super('User Not Found');
  }
}

export type ShowUserException = InvalidUserId | UserNotFound;

interface Registry {
  userOfId: UserOfId;
}

export const applicationService: ApplicationService<
  Registry,
  ShowUserCommand,
  ShowUserException,
  User
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
