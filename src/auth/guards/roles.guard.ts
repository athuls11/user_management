import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, UserInterface } from '../../user/interface/user.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    // @Inject(forwardRef(() => UserService))
    private usersService: UserService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserInterface = request.user;
    return this.usersService
      .getUserById(user.id)
      .then((user: UserInterface[]) => {
        const Role = () => roles.indexOf(user[0].role) > -1;

        let hasPermission: boolean = false;
        if (Role()) {
          hasPermission = true;
        }
        return user[0] && hasPermission;
      });
  }
}
