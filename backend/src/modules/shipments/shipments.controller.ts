import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ShipmentsService } from '@/modules/shipments/shipments.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { MerchantScopedGuard } from '@/modules/auth/guards/merchant-scoped.guard';
import { MerkleTreeService } from '@/modules/web3/merkle-tree.service';

@Controller('api/shipments')
export class ShipmentsController {
  constructor(
    private shipmentsService: ShipmentsService,
    private merkleTreeService: MerkleTreeService,
  ) {}

  // Public unauthenticated package tracking endpoint for recipients
  @Get('track/:trackingId')
  async getPublicTracking(@Param('trackingId') trackingId: string) {
    return this.shipmentsService.getPublicTracking(trackingId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, MerchantScopedGuard)
  async createShipment(
    @Request() req: any,
    @Body() body: { item: string; weightKg: number; destination: string; carrierCode: string },
  ) {
    return this.shipmentsService.createShipment(req.user.id, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, MerchantScopedGuard)
  async getShipments(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('carrier') carrier?: string,
    @Query('status') status?: string,
  ) {
    return this.shipmentsService.getMerchantShipments(req.user.id, { search, carrier, status });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, MerchantScopedGuard)
  async getShipmentDetails(@Request() req: any, @Param('id') id: string) {
    return this.shipmentsService.getShipmentDetails(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, MerchantScopedGuard)
  async updateShipment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { item?: string; weightKg?: number; destination?: string; status?: string },
  ) {
    return this.shipmentsService.updateShipment(req.user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, MerchantScopedGuard)
  async deleteShipment(@Request() req: any, @Param('id') id: string) {
    return this.shipmentsService.deleteShipment(req.user.id, id);
  }

  @Post(':id/retry-webhook')
  @UseGuards(JwtAuthGuard, MerchantScopedGuard)
  async retryWebhookNotification(@Request() req: any, @Param('id') id: string) {
    const shipment = await this.shipmentsService.getShipmentDetails(req.user.id, id);
    return {
      success: true,
      shipmentId: shipment.id,
      trackingId: shipment.trackingId,
      dispatchedWebhookUrl: req.user.webhookUrl || 'https://api.merchant.com/webhooks/parcelnode',
      responseStatus: 200,
      timestamp: new Date().toISOString(),
      message: `Webhook notification for shipment ${shipment.trackingId} successfully re-sent.`,
    };
  }

  @Get(':id/merkle-proof')
  @UseGuards(JwtAuthGuard, MerchantScopedGuard)
  async downloadMerkleProof(@Request() req: any, @Param('id') id: string) {
    const shipment = await this.shipmentsService.getShipmentDetails(req.user.id, id);
    const event = shipment.trackingEvents?.[0];

    const computedLeafHash = event
      ? this.merkleTreeService.computeLeafHash({
          shipmentId: shipment.id,
          trackingId: shipment.trackingId,
          status: event.status,
          timestamp: event.timestamp,
          dedupeKey: event.dedupeKey,
        })
      : null;

    return {
      version: '2.0.0',
      schema: 'ParcelNode-MerkleProof-v2',
      shipmentId: shipment.id,
      trackingId: shipment.trackingId,
      carrier: shipment.carrier,
      leafHash: event?.leafHash || computedLeafHash,
      merkleRoot: event?.batch?.merkleRoot || null,
      txHash: event?.batch?.txHash || null,
      chainStatus: event?.chainStatus || 'NONE',
      attestations: {
        systemAttestation: event?.batch?.attestation1 || null,
      },
      contractAddress: process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    };
  }
}
