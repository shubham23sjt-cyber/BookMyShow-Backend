import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateShowDto {
  @IsString()
  @IsNotEmpty()
  movieId!: string;

  @IsDateString()
  startTime!: string;
}