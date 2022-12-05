import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { ProfileType } from '@app/types/profile/profile.type';
import { ProfileResponseInterface } from '@app/types/profile/profileResponse.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUserName,
    });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });

    return {
      ...user,
      following: !!follow,
    };
  }

  async followProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUserName,
    });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === user.id) {
      throw new HttpException(
        'Follower and following cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return {
      ...user,
      following: true,
    };
  }

  async unFollowProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<ProfileType> {
    const userProfile = await this.userRepository.findOne({
      username: profileUserName,
    });

    if (!userProfile) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === userProfile.id) {
      throw new HttpException(
        'Follower and following cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: userProfile.id,
    });

    return {
      ...userProfile,
      following: false,
    };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
}
