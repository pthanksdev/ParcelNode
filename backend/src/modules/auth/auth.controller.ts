import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
