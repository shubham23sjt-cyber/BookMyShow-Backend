import { Body, Controller, Post, Req, UseGuards, Get, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';
import { CreateBookingDto } from './dto/create.booking.dto';

interface AuthenticatedRequest {
  user: {
    userId: string;
  };
}

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  bookSeats(@Body() dto: CreateBookingDto, @Req() req: AuthenticatedRequest) {
    return this.bookingService.bookSeats(req.user.userId, dto.showId, dto.seatIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  getMyBookings(@Req() req: AuthenticatedRequest) {
    return this.bookingService.getMyBookings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getBookingById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.bookingService.getBookingById(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/cancel')
  cancelBooking(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.bookingService.cancelBooking(req.user.userId, id);
  }
}
