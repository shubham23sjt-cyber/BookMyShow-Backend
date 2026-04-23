import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import{ConfigModule} from '@nestjs/config'
import { MovieModule } from './movie/movie.module';
import { ShowModule } from './show/show.module';
import { SeatsModule } from './seats/seats.module';

@Module({
  imports: [PrismaModule, BookingModule, AuthModule,ConfigModule.forRoot({isGlobal:true
  }), MovieModule, ShowModule, SeatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
