import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SetPortalAccessDto {
    @IsString()
    @IsNotEmpty()
    tgid: string;

    @IsBoolean()
    @IsNotEmpty()
    protalUser: boolean;
}