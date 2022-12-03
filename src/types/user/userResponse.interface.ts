import { UserType } from '@app/types/user/user.type';

export interface UserResponseInterface {
  user: UserType & { token: string };
}
