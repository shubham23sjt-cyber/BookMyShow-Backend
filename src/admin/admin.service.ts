import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueAnalytics() {
    const events = await this.prisma.event.findMany({
      include: {
        shows: {
          include: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    });

    return events.map((event) => {
      let revenue = 0;
      event.shows.forEach((show) => {
        show.bookings.forEach((booking) => {
          revenue += booking.totalPrice;
        });
      });
      return {
        eventId: event.id,
        title: event.title,
        revenue,
      };
    });
  }

  async getOccupancyAnalytics() {
    const shows = await this.prisma.show.findMany({
      include: {
        event: true,
        venue: true,
        seats: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            seats: true,
          },
        },
      },
    });

    return shows.map((show) => {
      const totalSeats = show.seats.length;
      let bookedSeatsCount = 0;
      show.bookings.forEach((booking) => {
        bookedSeatsCount += booking.seats.length;
      });
      const occupancyRate =
        totalSeats > 0 ? (bookedSeatsCount / totalSeats) * 100 : 0;
      return {
        showId: show.id,
        eventTitle: show.event.title,
        venueName: show.venue.name,
        startTime: show.startTime,
        totalSeats,
        bookedSeats: bookedSeatsCount,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
      };
    });
  }
}
