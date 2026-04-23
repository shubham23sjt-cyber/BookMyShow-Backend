import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  create(@Body() dto:CreateMovieDto){
    return this.movieService.create(dto);
  }

  @Get()
  findaAll(){
    return this.movieService.findAll()
  }

  @Get(':id')
  findOne(@Param(':id') id:string){
    return this.movieService.findone(id);
  }

  @Delete(':id')
  remove(@Param(':id') id:string){
    return this.movieService.delete(id);
  }

}
