import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventType } from '@prisma/client';
import { EventQueryDto } from './dto/event-query.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        duration: dto.duration,
      },
    });
  }

  async findAll(filters: EventQueryDto) {
    const page = filters.page ? Number(filters.page) : 1;
    const limit = filters.limit ? Number(filters.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filter by city and/or show date range
    if (filters.city || filters.startDate || filters.endDate) {
      const showWhere: any = {};

      if (filters.city) {
        showWhere.venue = {
          city: { equals: filters.city, mode: 'insensitive' },
        };
      }

      if (filters.startDate || filters.endDate) {
        showWhere.startTime = {};
        if (filters.startDate) {
          showWhere.startTime.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          showWhere.startTime.lte = new Date(filters.endDate);
        }
      }

      where.shows = {
        some: showWhere,
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async delete(id: string) {
    // Ensure the event exists before deleting to throw clear 404 error
    await this.findOne(id);
    return this.prisma.event.delete({
      where: { id },
    });
  }
}
