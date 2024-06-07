import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { CreateUserDto, LoginDto, UpdateUserDto } from '../dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtGuard } from '../../auth/guards/jwt.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() userDto: CreateUserDto) {
    let users = await this.userService.signup({ userDto });
    return {
      message: 'User signed up successfully',
      users,
    };
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() loginUserDto: LoginDto) {
    try {
      let user = await this.userService.getUserByEmail(loginUserDto.email);
      if (!user) throw new HttpException('Incorrect Email', 400);
      let ismatch: boolean = await this.userService.comparePasswords(
        loginUserDto.password,
        user.password,
      );

      if (!ismatch) throw new HttpException('Incorrect Password', 400);

      let access_token: string = await this.authService.generateAccessToken(
        user.email,
        user._id.toString(),
        user.role,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'User signed in successfully',
        access_token,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtGuard)
  @Post('create')
  @HttpCode(201)
  async createUser(@Body() userDto: CreateUserDto, @Req() req: any) {
    try {
      if (req.user.role === 'user' && userDto.role === 'admin') {
        throw new UnauthorizedException(
          'Unauthorized: Only admins can add admins.',
        );
      }
      await this.userService.signup({ userDto });
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Added successfully.',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtGuard)
  @Patch('update/:id')
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    const userId = req.params.id;
    const currentUserRole = req.user.role;

    try {
      const updatedUser = await this.userService.update(
        userId,
        updateUserDto,
        currentUserRole,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully.',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
