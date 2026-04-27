import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';
import { CreateBookingDto } from './dto/create.booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  bookSeats(@Body() dto:CreateBookingDto,@Req() req){
    return this.bookingService.bookSeats(
      req.user.userId,
      dto.showId,
      dto.seatIds
    )
  }
}
