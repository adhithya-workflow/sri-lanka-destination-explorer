
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const adminUsername =
      this.config.get<string>('ADMIN_USERNAME');

    const passwordHash =
      this.config.get<string>('ADMIN_PASSWORD_HASH');

    if (!adminUsername || !passwordHash) {
      throw new Error('Admin credentials are not configured');
    }

    const usernameMatches = username === adminUsername;
    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash,
    );

    if (!usernameMatches || !passwordMatches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const accessToken = await this.jwt.signAsync({
      sub: adminUsername,
      role: 'admin',
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
    };
  }
}
