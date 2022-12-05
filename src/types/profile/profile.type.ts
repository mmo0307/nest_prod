import { UserType } from '@app/types/user/user.type';

export type ProfileType = UserType & { following: boolean };
