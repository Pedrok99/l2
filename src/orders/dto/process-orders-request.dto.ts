import { ApiProperty } from '@nestjs/swagger';
import { PedidoDto } from './order.dto';

export class ProcessOrdersRequestDto {
  @ApiProperty({ type: [PedidoDto], description: 'Lista de pedidos para processar' })
  pedidos: PedidoDto[];
}
