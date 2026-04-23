import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeatsService {
    constructor(private prisma:PrismaService){}

    async generateSeats(showId:string){
        const existing=await this.prisma.seat.findFirst({
            where:{showId},
        });
        if(existing) {throw new  BadRequestException('seats already generated for this show');}

    
    const seats:{ showId: string; number: string }[] =[];
    ['A','B','C'].forEach((row) => {
        for(let i=1;i<=10;i++){
            seats.push({
                showId,
                number:`${row}${i}`,
            });
        }
        
    });
    return this.prisma.seat.createMany({
        data:seats,
    });
    }
  async getSeats(showId: string) {
  const seats = await this.prisma.seat.findMany({
    where: { showId },
  });

  const bookedSeats = await this.prisma.bookingSeat.findMany({
    where: { showId },
  });

  const bookedSet = new Set(bookedSeats.map((b) => b.seatId));

  return seats
    .map((seat) => ({
      ...seat,
      isBooked: bookedSet.has(seat.id),
    }))
    .sort((a, b) => {
      const rowCompare = a.number[0].localeCompare(b.number[0]);
      if (rowCompare !== 0) return rowCompare;

      return parseInt(a.number.slice(1)) - parseInt(b.number.slice(1));
    });
}
}
