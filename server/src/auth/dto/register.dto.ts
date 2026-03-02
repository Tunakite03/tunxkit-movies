import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
   @IsOptional()
   @IsString()
   readonly name?: string;

   @IsEmail({}, { message: 'Email không hợp lệ.' })
   @IsNotEmpty({ message: 'Email không được để trống.' })
   readonly email!: string;

   @IsString()
   @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
   @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
   readonly password!: string;
}
