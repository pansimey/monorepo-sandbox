import { User } from '../entity/user';

export interface UserOfId {
  (userId: string): Promise<User | undefined>;
}
