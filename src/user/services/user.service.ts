import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from '../interface/user.interface';
import * as bcrypt from 'bcrypt';
import { User } from '../schema/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
    // private readonly authService: AuthService,
  ) {}

  async signup({ userDto }): Promise<User> {
    const { password, confirmPassword, ...rest } = userDto;
    // Validate confirm password
    if (password !== confirmPassword) {
      throw new Error('Confirm password does not match.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      ...rest,
      password: hashedPassword,
      createdTime: new Date(),
      updatedTime: new Date(),
    });
    return createdUser.save();
  }

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ email: email });
  }

  async getUserById(id: string): Promise<any> {
    return await this.userModel.find({ _id: id });
  }

  async comparePasswords(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    const pwMatches: boolean = await bcrypt.compare(password, passwordHash);
    return pwMatches;
  }

  async createUser(
    createUserDto: CreateUserDto,
    // currentUserRole: Role,
  ): Promise<User> {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // if (currentUserRole === Role.USER && createUserDto.role === Role.ADMIN) {
    //   throw new BadRequestException('Users cannot create Admins');
    // }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      createdTime: new Date(),
      updatedTime: new Date(),
    });
    return createdUser.save();
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUserRole: string,
  ): Promise<UserInterface> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (currentUserRole === 'user' && user.role === 'admin') {
      throw new UnauthorizedException(
        'Unauthorized: Insufficient permissions to update this user.',
      );
    }

    Object.assign(user, updateUserDto);
    user.updatedTime = new Date();

    return await user.save();
  }

  async view(userId: string, currentUserRole: string) {
    const user = await this.userModel.findById(userId);
    if (currentUserRole === 'user') {
      return await this.userModel
        .find({ role: 'user' })
        .select('-password -createdTime -updatedTime -__v');
    }
    return await this.userModel
      .find()
      .select('-password -createdTime -updatedTime -__v');
  }
}
