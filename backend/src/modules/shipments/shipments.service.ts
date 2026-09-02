import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { FastShipAdapter } from '@/modules/carriers/fastship.adapter';
import { EcoDeliverAdapter } from '@/modules/carriers/ecodeliver.adapter';

@Injectable()
export class ShipmentsService {
  constructor(
    private prisma: PrismaService,
    private fastShip: FastShipAdapter,
    private ecoDeliver: EcoDeliverAdapter,
  ) {}

  async createShipment(merchantId: string, dto: {
    item: string;
    weightKg: number;
    destination: string;
    carrierCode: string;
  }) {
    const carrierAdapter = dto.carrierCode === 'FASTSHIP' ? this.fastShip : this.ecoDeliver;

    // 1. Create order scoped to merchant
    const order = await this.prisma.order.create({
      data: {
        merchantId,
        item: dto.item,
        weightKg: dto.weightKg,
        destination: dto.destination,
      },
    });

    // 2. Dispatch creation to selected carrier adapter
    const shipmentResult = await carrierAdapter.createShipment({
      orderId: order.id,
      item: dto.item,
      weightKg: dto.weightKg,
      destination: dto.destination,
      serviceName: carrierAdapter.carrierName,
    });

    // 3. Create Shipment and initial TrackingEvent
    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: carrierAdapter.carrierCode,
        trackingId: shipmentResult.trackingId,
        status: shipmentResult.initialStatus,
        trackingEvents: {
          create: {
            status: shipmentResult.initialStatus,
            location: 'Origin Processing Center',
            timestamp: new Date(),
            dedupeKey: `${shipmentResult.trackingId}-PICKED_UP-${Date.now()}`,
          },
        },
      },
      include: {
        order: true,
        trackingEvents: true,
      },
    });

    return shipment;
  }

  async getMerchantShipments(merchantId: string, query?: { search?: string; carrier?: string; status?: string }) {
    const whereClause: any = {
      order: { merchantId },
    };

    if (query?.carrier) {
      whereClause.carrier = query.carrier;
    }
    if (query?.status) {
      whereClause.status = query.status;
    }
    if (query?.search) {
      whereClause.OR = [
        { trackingId: { contains: query.search, mode: 'insensitive' } },
        { order: { item: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.shipment.findMany({
      where: whereClause,
      include: {
        order: true,
        trackingEvents: {
          include: { batch: true },
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShipmentDetails(merchantId: string, shipmentId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        id: shipmentId,
        order: { merchantId },
      },
      include: {
        order: true,
        trackingEvents: {
          include: { batch: true },
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found or unauthorized');
    }

    return shipment;
  }

  async getPublicTracking(trackingId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { trackingId },
      include: {
        order: {
          select: {
            item: true,
            weightKg: true,
            destination: true,
          },
        },
        trackingEvents: {
          include: { batch: true },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Tracking ID ${trackingId} not found`);
    }

    return shipment;
  }

  async updateShipment(
    merchantId: string,
    shipmentId: string,
    dto: { item?: string; weightKg?: number; destination?: string; status?: string },
  ) {
    const shipment = await this.getShipmentDetails(merchantId, shipmentId);

    // Update order fields
    if (dto.item || dto.weightKg || dto.destination) {
      await this.prisma.order.update({
        where: { id: shipment.orderId },
        data: {
          ...(dto.item && { item: dto.item }),
          ...(dto.weightKg && { weightKg: dto.weightKg }),
          ...(dto.destination && { destination: dto.destination }),
        },
      });
    }

    // Update shipment status if provided
    if (dto.status) {
      await this.prisma.shipment.update({
        where: { id: shipmentId },
        data: { status: dto.status },
      });

      // Log status update event
      await this.prisma.trackingEvent.create({
        data: {
          shipmentId,
          status: dto.status,
          location: 'Merchant Operations Center (Updated)',
          timestamp: new Date(),
          dedupeKey: `${shipment.trackingId}-${dto.status}-${Date.now()}`,
        },
      });
    }

    return this.getShipmentDetails(merchantId, shipmentId);
  }

  async deleteShipment(merchantId: string, shipmentId: string) {
    const shipment = await this.getShipmentDetails(merchantId, shipmentId);

    // Delete tracking events, shipment, and order sequentially
    await this.prisma.trackingEvent.deleteMany({
      where: { shipmentId },
    });

    await this.prisma.shipment.delete({
      where: { id: shipmentId },
    });

    await this.prisma.order.delete({
      where: { id: shipment.orderId },
    });

    return {
      success: true,
      message: `Shipment ${shipment.trackingId} successfully canceled and removed.`,
    };
  }
}
