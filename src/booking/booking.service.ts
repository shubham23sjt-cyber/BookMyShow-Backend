import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async bookSeats(userId: string, showId: string, seatIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify that all requested seatIds exist and belong to the specified showId
      const seats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
          showId,
        },
      });

      if (seats.length !== seatIds.length) {
        throw new BadRequestException(
          'One or more selected seats are invalid for this show',
        );
      }

      // 2. Check if any of the requested seats are already booked
      const existingBookings = await tx.bookingSeat.findMany({
        where: {
          showId,
          seatId: { in: seatIds },
        },
      });

      if (existingBookings.length > 0) {
        throw new BadRequestException(
          'One or more of the selected seats are already booked',
        );
      }

      // 2b. Check if any of the requested seats are held by someone else
      const activeHoldsByOthers = await tx.seatHold.findFirst({
        where: {
          showId,
          seatId: { in: seatIds },
          expiresAt: { gt: new Date() },
          userId: { not: userId },
        },
      });

      if (activeHoldsByOthers) {
        throw new BadRequestException(
          'One or more of the selected seats are held by another user',
        );
      }

      // 3. Calculate total booking cost
      const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

      // 4. Create the booking entry
      const booking = await tx.booking.create({
        data: {
          userId,
          showId,
          totalPrice,
          status: 'CONFIRMED',
        },
      });

      // 5. Link the booked seats to the booking record
      await tx.bookingSeat.createMany({
        data: seatIds.map((seatId) => ({
          bookingId: booking.id,
          seatId,
          showId,
        })),
      });

      // 5b. Remove the holds for these seats as they are now booked
      await tx.seatHold.deleteMany({
        where: {
          showId,
          seatId: { in: seatIds },
        },
      });

      return {
        message: 'Booking Successful',
        bookingId: booking.id,
        totalPrice,
        seatsBooked: seats.map((s) => ({
          id: s.id,
          number: s.number,
          category: s.category,
          price: s.price,
        })),
      };
    });
  }

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        show: {
          include: {
            event: true,
            venue: true,
          },
        },
        seats: {
          include: {
            seat: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        show: {
          include: {
            event: true,
            venue: true,
          },
        },
        seats: {
          include: {
            seat: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('You do not have permission to view this booking');
    }

    return booking;
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('You do not have permission to cancel this booking');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all booking seats associations to free the seats
      await tx.bookingSeat.deleteMany({
        where: { bookingId },
      });

      // 2. Set booking status to CANCELLED
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      return {
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
      };
    });
  }
}
