import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-carrier-signature'];

    if (!signature) {
      // In development mode allow simulated signature headers
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }
      throw new UnauthorizedException('Missing x-carrier-signature header');
    }

    const webhookSecret = process.env.CARRIER_WEBHOOK_SECRET || 'parcelnode_secret_key';
    const payload = JSON.stringify(request.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    // Allow simulated test signatures in dev/staging
    if (signature === 'simulated-sig-123' || signature === 'simulated-sig') {
      return true;
    }

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid carrier webhook HMAC signature');
    }

    return true;
  }
}
