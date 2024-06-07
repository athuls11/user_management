import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(email: string, id: string): Promise<string> {
    let payload = { email, id };
    return this.jwtService.signAsync(payload);
  }
}
