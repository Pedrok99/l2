import { ApiProperty } from '@nestjs/swagger';
import { PedidoEmbalagemDto } from './order.dto';

export class ProcessOrdersResponseDto {
  @ApiProperty({ type: [PedidoEmbalagemDto], description: 'Lista de pedidos processados com embalagens' })
  pedidos: PedidoEmbalagemDto[];
}
