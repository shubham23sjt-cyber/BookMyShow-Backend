import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookingService {
    constructor (private Prisma:PrismaService){}

    async bookSeats(userId:string,showId:string,seatIds:string[]){
        return this.Prisma.$transaction(async(tx)=>{
            const existing =await tx.bookingSeat.findMany({
                where:{
                    showId,
                    seatId:{in:seatIds},
                },
            });
            if(existing.length>0){
                throw new BadRequestException("some seats already booked");
            }
            const booking =await tx.booking.create({
                data:{
                    userId,
                    showId,
                },
            });

            await  tx.bookingSeat.createMany({
                data:seatIds.map((seatId)=>({
                    bookingId:booking.id,
                    seatId,
                    showId
                }))
            });
            return {
                messge:'Booking Successful',
                bookingId:booking.id
            }
        })
    }
}
