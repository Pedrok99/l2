import { ApiProperty } from '@nestjs/swagger';
import { DimensoesDto } from './dimensions.dto';

export class ProdutoDto {
  @ApiProperty({ example: 'PS5', description: 'Identificador único do produto' })
  produto_id: string;

  @ApiProperty({ type: DimensoesDto, description: 'Dimensões do produto' })
  dimensoes: DimensoesDto;
}

export class ProdutoEmbalagemDto {
  @ApiProperty({ example: 'PS5', description: 'Identificador único do produto' })
  produto_id: string;

  @ApiProperty({ example: 'Caixa 1', description: 'ID da caixa onde o produto foi alocado' })
  caixa_id: string | null;

  @ApiProperty({ example: 'Product does not fit in any available box.', description: 'Observação sobre o produto', required: false })
  observacao?: string;
}
