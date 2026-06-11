import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateSeatsDto } from './dto/generate-seats.dto';

@Injectable()
export class SeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSeats(showId: string, dto?: GenerateSeatsDto) {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
    });
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found`);
    }

    const existing = await this.prisma.seat.findFirst({
      where: { showId },
    });
    if (existing) {
      throw new BadRequestException('Seats already generated for this show');
    }

    const vipPrice = dto?.vipPrice ?? 100.0;
    const premiumPrice = dto?.premiumPrice ?? 75.0;
    const standardPrice = dto?.standardPrice ?? 50.0;

    const vipCount = dto?.vipCount ?? 10;
    const premiumCount = dto?.premiumCount ?? 10;
    const standardCount = dto?.standardCount ?? 10;

    const seats: {
      showId: string;
      number: string;
      category: string;
      price: number;
    }[] = [];

    // Generate VIP Seats (Row V)
    for (let i = 1; i <= vipCount; i++) {
      seats.push({
        showId,
        number: `V${i}`,
        category: 'VIP',
        price: vipPrice,
      });
    }

    // Generate Premium Seats (Row P)
    for (let i = 1; i <= premiumCount; i++) {
      seats.push({
        showId,
        number: `P${i}`,
        category: 'Premium',
        price: premiumPrice,
      });
    }

    // Generate Standard Seats (Row S)
    for (let i = 1; i <= standardCount; i++) {
      seats.push({
        showId,
        number: `S${i}`,
        category: 'Standard',
        price: standardPrice,
      });
    }

    await this.prisma.seat.createMany({
      data: seats,
    });

    return {
      message: 'Seats generated successfully',
      generatedCount: seats.length,
    };
  }

  async getSeats(showId: string, userId?: string) {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
    });
    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found`);
    }

    const seats = await this.prisma.seat.findMany({
      where: { showId },
    });

    const bookedSeats = await this.prisma.bookingSeat.findMany({
      where: { showId },
    });

    // Clean up expired holds dynamically
    await this.prisma.seatHold.deleteMany({
      where: {
        showId,
        expiresAt: { lt: new Date() },
      },
    });

    const activeHolds = await this.prisma.seatHold.findMany({
      where: {
        showId,
        expiresAt: { gt: new Date() },
      },
    });

    const bookedSet = new Set(bookedSeats.map((b) => b.seatId));
    const holdsMap = new Map(activeHolds.map((h) => [h.seatId, h.userId]));

    return seats
      .map((seat) => {
        const holdingUserId = holdsMap.get(seat.id);
        return {
          ...seat,
          isBooked: bookedSet.has(seat.id),
          isHeld: holdingUserId !== undefined,
          heldByMe: userId ? holdingUserId === userId : false,
        };
      })
      .sort((a, b) => {
        const categoryPriority = (cat: string) => {
          if (cat === 'VIP') return 1;
          if (cat === 'Premium') return 2;
          return 3;
        };
        const priorityCompare =
          categoryPriority(a.category) - categoryPriority(b.category);
        if (priorityCompare !== 0) return priorityCompare;

        const aNum = parseInt(a.number.slice(1));
        const bNum = parseInt(b.number.slice(1));
        return aNum - bNum;
      });
  }

  async holdSeats(userId: string, showId: string, seatIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify show exists
      const show = await tx.show.findUnique({ where: { id: showId } });
      if (!show) throw new NotFoundException(`Show with ID ${showId} not found`);

      // 2. Verify all seats exist and belong to this show
      const seats = await tx.seat.findMany({
        where: { id: { in: seatIds }, showId },
      });
      if (seats.length !== seatIds.length) {
        throw new BadRequestException('One or more selected seats are invalid for this show');
      }

      // 3. Clear expired holds generally for this show to clean up
      await tx.seatHold.deleteMany({
        where: {
          showId,
          expiresAt: { lt: new Date() },
        },
      });

      // 4. Check if any seat is already booked
      const booked = await tx.bookingSeat.findFirst({
        where: { showId, seatId: { in: seatIds } },
      });
      if (booked) {
        throw new BadRequestException('One or more selected seats are already booked');
      }

      // 5. Check if any seat is held by someone else (active holds where user is NOT current user)
      const heldByOthers = await tx.seatHold.findFirst({
        where: {
          showId,
          seatId: { in: seatIds },
          expiresAt: { gt: new Date() },
          userId: { not: userId },
        },
      });
      if (heldByOthers) {
        throw new BadRequestException('One or more selected seats are held by another user');
      }

      // 6. Delete any existing holds the CURRENT user has on these specific seats (to renew them)
      await tx.seatHold.deleteMany({
        where: {
          showId,
          userId,
          seatId: { in: seatIds },
        },
      });

      // 7. Create new holds
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      await tx.seatHold.createMany({
        data: seatIds.map((seatId) => ({
          showId,
          seatId,
          userId,
          expiresAt,
        })),
      });

      return {
        message: 'Seats held successfully',
        expiresAt,
        seatIds,
      };
    });
  }
}
