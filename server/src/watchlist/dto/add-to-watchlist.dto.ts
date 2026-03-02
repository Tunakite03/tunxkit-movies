import { IsInt, IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class AddToWatchlistDto {
   @IsInt({ message: 'mediaId phải là số nguyên.' })
   readonly id!: number;

   @IsString()
   readonly title!: string;

   @IsIn(['movie', 'tv'], { message: 'mediaType phải là "movie" hoặc "tv".' })
   readonly mediaType!: 'movie' | 'tv';

   @IsOptional()
   @IsString()
   readonly posterPath?: string | null;

   @IsOptional()
   @IsString()
   readonly backdropPath?: string | null;

   @IsOptional()
   @IsString()
   readonly overview?: string;

   @IsOptional()
   @IsString()
   readonly releaseDate?: string;

   @IsOptional()
   @IsNumber()
   readonly voteAverage?: number;
}
