import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class MerchantScopedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.id) {
      throw new ForbiddenException('User session context missing');
    }

    // Attach merchant ID directly to request for scoping downstream queries
    request.merchantId = user.id;
    return true;
  }
}
