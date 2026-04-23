import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShowDto } from './dto/create-show.dto';

@Injectable()
export class ShowService {
    constructor(private prisma:PrismaService){}

    async create(dto:CreateShowDto){
        const movie=await this.prisma.movie.findUnique({
            where:{id:dto.movieId}
        });
        if(!movie) throw new BadRequestException("movie not found");
        const existing = await this.prisma.show.findFirst({
  where: {
    movieId: dto.movieId,
    startTime: new Date(dto.startTime),
  },
});

if (existing) {
  throw new Error('Show already exists at this time');
}
        return this.prisma.show.create({
            data:{
                movieId:dto.movieId,
                startTime:new Date(dto.startTime),
            }

        });
    }

    async findAll(){
        return this.prisma.show.findMany({
            include:{
                movie:true,
            },
            orderBy:{startTime:'desc'}
        });
    }

    async findByMovie(movieId:string){
        return this.prisma.show.findMany({
            where:{movieId},
            orderBy:{startTime:'asc'}
        });
    }

}
