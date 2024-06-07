import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { CreateUserDto, LoginDto } from '../dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtGuard } from '../../auth/guards/jwt.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() userDto: CreateUserDto) {
    let users = await this.usersService.signup({ userDto });
    return {
      message: 'User signed up successfully',
      users,
    };
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() loginUserDto: LoginDto) {
    let user = await this.usersService.getUserByEmail(loginUserDto.email);
    if (!user) throw new HttpException('Incorrect Email', 400);
    let ismatch: boolean = await this.usersService.comparePasswords(
      loginUserDto.password,
      user.password,
    );

    if (!ismatch) throw new HttpException('Incorrect Password', 400);

    let access_token: string = await this.authService.generateAccessToken(
      user.email,
      user._id.toString(),
    );

    return {
      statusCode: 200,
      message: 'User signed in successfully',
      access_token,
    };
  }

  @UseGuards(JwtGuard)
  @Post('create')
  async createUser(
    // @Body() createUserDto: CreateUserDto,
   @Req() req: any) {
    console.log('---------', req.user);

    // const currentUserRole: Role = req.user.role;
    // return this.userService.createUser(createUserDto, currentUserRole);
  }
}
