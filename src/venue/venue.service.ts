import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        city: dto.city,
        address: dto.address,
      },
    });
  }

  async findAll(city?: string) {
    return this.prisma.venue.findMany({
      where: city ? { city: { equals: city, mode: 'insensitive' } } : {},
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
    });
    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }
    return venue;
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.venue.delete({
      where: { id },
    });
  }
}
