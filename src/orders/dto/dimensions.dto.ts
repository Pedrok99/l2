import { ApiProperty } from '@nestjs/swagger';

export class DimensoesDto {
  @ApiProperty({ example: 40, description: 'Altura do produto em centímetros' })
  altura: number;

  @ApiProperty({ example: 10, description: 'Largura do produto em centímetros' })
  largura: number;

  @ApiProperty({ example: 25, description: 'Comprimento do produto em centímetros' })
  comprimento: number;
}
