import { BusinessError } from '@libs/sup/src';

export class InvalidUserId extends BusinessError {
  override name = 'InvalidUserId' as const;

  constructor() {
    super('Invalid User ID');
  }
}
