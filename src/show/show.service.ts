import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShowDto } from './dto/create-show.dto';

@Injectable()
export class ShowService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShowDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) throw new BadRequestException('Event not found');

    const venue = await this.prisma.venue.findUnique({
      where: { id: dto.venueId },
    });
    if (!venue) throw new BadRequestException('Venue not found');

    const existing = await this.prisma.show.findFirst({
      where: {
        venueId: dto.venueId,
        startTime: new Date(dto.startTime),
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A show is already scheduled at this venue at this time',
      );
    }

    return this.prisma.show.create({
      data: {
        eventId: dto.eventId,
        venueId: dto.venueId,
        startTime: new Date(dto.startTime),
      },
      include: {
        event: true,
        venue: true,
      },
    });
  }

  async findAll() {
    return this.prisma.show.findMany({
      include: {
        event: true,
        venue: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findByEvent(eventId: string) {
    return this.prisma.show.findMany({
      where: { eventId },
      include: {
        event: true,
        venue: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findByVenue(venueId: string) {
    return this.prisma.show.findMany({
      where: { venueId },
      include: {
        event: true,
        venue: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const show = await this.prisma.show.findUnique({
      where: { id },
      include: {
        event: true,
        venue: true,
      },
    });
    if (!show) {
      throw new NotFoundException(`Show with ID ${id} not found`);
    }
    return show;
  }
}
