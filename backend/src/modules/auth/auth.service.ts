import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/core/database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: { name: string; email: string; password: string }) {
    const existing = await this.prisma.merchant.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Merchant email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const merchant = await this.prisma.merchant.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
    });

    const token = this.jwtService.sign({ sub: merchant.id, email: merchant.email, role: merchant.role || 'MERCHANT' });
    return {
      accessToken: token,
      merchant: { id: merchant.id, name: merchant.name, email: merchant.email, role: merchant.role || 'MERCHANT' },
    };
  }

  async login(dto: { email: string; password: string }) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { email: dto.email },
    });

    if (!merchant) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, merchant.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ sub: merchant.id, email: merchant.email, role: merchant.role || 'MERCHANT' });
    return {
      accessToken: token,
      merchant: { id: merchant.id, name: merchant.name, email: merchant.email, role: merchant.role || 'MERCHANT' },
    };
  }
}
