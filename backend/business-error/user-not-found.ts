import { BusinessError } from '@libs/sup';

export class UserNotFound extends BusinessError {
  override name = 'UserNotFound' as const;

  constructor() {
    super('User Not Found');
  }
}
