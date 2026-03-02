import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
   @IsString()
   @IsNotEmpty({ message: 'Tên hiển thị không được để trống.' })
   readonly name!: string;

   @IsOptional()
   @IsString()
   readonly image?: string;
}

export class UpdatePasswordDto {
   @IsString()
   @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống.' })
   readonly currentPassword!: string;

   @IsString()
   @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' })
   @IsNotEmpty({ message: 'Mật khẩu mới không được để trống.' })
   readonly newPassword!: string;
}
