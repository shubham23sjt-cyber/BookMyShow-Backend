import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  duration!: number;
}