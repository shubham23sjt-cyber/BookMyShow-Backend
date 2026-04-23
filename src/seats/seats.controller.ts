import { Controller, Get, Param, Post } from '@nestjs/common';
import { SeatsService } from './seats.service';

@Controller('seats')
export class SeatsController {
  constructor(private seatsService: SeatsService) {}

  @Post(':showId')
  generate(@Param('showId') showId: string) {
    return this.seatsService.generateSeats(showId);
  }

  @Get(':showId')
  getSeats(@Param('showId') showId: string) {
    return this.seatsService.getSeats(showId);
  }
}