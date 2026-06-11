import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { GenerateSeatsDto } from './dto/generate-seats.dto';
import { HoldSeatsDto } from './dto/hold-seats.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedRequest {
  user: {
    userId: string;
  };
  headers: {
    authorization?: string;
  };
}

@Controller('seats')
export class SeatsController {
  constructor(
    private readonly seatsService: SeatsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(':showId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  generate(@Param('showId') showId: string, @Body() dto?: GenerateSeatsDto) {
    return this.seatsService.generateSeats(showId, dto);
  }

  @Post('hold/:showId')
  @UseGuards(JwtAuthGuard)
  hold(
    @Param('showId') showId: string,
    @Body() dto: HoldSeatsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.seatsService.holdSeats(req.user.userId, showId, dto.seatIds);
  }

  @Get(':showId')
  getSeats(@Param('showId') showId: string, @Req() req: AuthenticatedRequest) {
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const payload = this.jwtService.verify(token, {
            secret: 'secretkey',
          });
          userId = payload?.userId;
        } catch (err) {
          // Ignore invalid/expired token for public listing
        }
      }
    }
    return this.seatsService.getSeats(showId, userId);
  }
}
