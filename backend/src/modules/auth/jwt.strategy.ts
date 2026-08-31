import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345!',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: payload.sub },
    });

    if (!merchant) {
      throw new UnauthorizedException('Merchant account no longer exists');
    }

    return { id: merchant.id, email: merchant.email, name: merchant.name };
  }
}
