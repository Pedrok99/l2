import { ApiProperty } from '@nestjs/swagger';
import { ProdutoDto } from './product.dto';

export class PedidoDto {
  @ApiProperty({ example: 1, description: 'Identificador único do pedido' })
  pedido_id: number;

  @ApiProperty({ type: [ProdutoDto], description: 'Lista de produtos do pedido' })
  produtos: ProdutoDto[];
}

export class CaixaDto {
  @ApiProperty({ example: 'Caixa 2', description: 'Identificador da caixa', nullable: true })
  caixa_id: string | null;

  @ApiProperty({ example: ['PS5', 'Volante'], description: 'Lista de produto_ids na caixa' })
  produtos: string[];

  @ApiProperty({ example: 'Produto não cabe em nenhuma caixa disponível.', description: 'Observação sobre produtos que não cabem', required: false })
  observacao?: string;
}

export class PedidoEmbalagemDto {
  @ApiProperty({ example: 1, description: 'Identificador único do pedido' })
  pedido_id: number;

  @ApiProperty({ type: [CaixaDto], description: 'Lista de caixas usadas no pedido' })
  caixas: CaixaDto[];
}
