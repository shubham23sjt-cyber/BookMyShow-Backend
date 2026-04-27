import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[PrismaModule,AuthModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
