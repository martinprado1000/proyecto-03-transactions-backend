import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator"

export class PaginationDto {

    @ApiProperty({
        default: 10, description: 'How many rows do you need?'
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Type(()=> Number)
    limit?:number
    
    @ApiProperty({
        default: 0, description: 'How many rows do you want to skip?'
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(()=> Number)  
    offset?:number

}   