import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('show')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateShowDto) {
    return this.showService.create(dto);
  }

  @Get()
  findAll() {
    return this.showService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showService.findOne(id);
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.showService.findByEvent(eventId);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: string) {
    return this.showService.findByVenue(venueId);
  }
}
