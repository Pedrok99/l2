import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProcessOrdersRequestDto } from './dto/process-orders-request.dto';
import { ProcessOrdersResponseDto } from './dto/process-orders-response.dto';
import { PackingService } from './services/packing.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly packingService: PackingService) {}

  @Post('process')
  @ApiOperation({ 
    summary: 'Process orders and pack products into boxes',
    description: 'Receives a list of orders with products and returns how to pack them into available boxes'
  })
  @ApiBody({
    type: ProcessOrdersRequestDto,
    examples: {
      example1: {
        summary: 'Example with PS5 and Volante',
        value: {
          pedidos: [
            {
              pedido_id: 1,
              produtos: [
                {
                  produto_id: 'PS5',
                  dimensoes: {
                    altura: 40,
                    largura: 10,
                    comprimento: 25
                  }
                },
                {
                  produto_id: 'Volante',
                  dimensoes: {
                    altura: 40,
                    largura: 30,
                    comprimento: 30
                  }
                }
              ]
            }
          ]
        }
      },
      example2: {
        summary: 'Example with product that does not fit',
        value: {
          pedidos: [
            {
              pedido_id: 1,
              produtos: [
                {
                  produto_id: 'Smartphone',
                  dimensoes: {
                    altura: 15,
                    largura: 7,
                    comprimento: 1
                  }
                },
                {
                  produto_id: 'TV Grande',
                  dimensoes: {
                    altura: 100,
                    largura: 150,
                    comprimento: 20
                  }
                }
              ]
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Orders processed successfully',
    type: ProcessOrdersResponseDto,
    examples: {
      example1: {
        summary: 'Successful packing result',
        value: {
          pedidos: [
            {
              pedido_id: 1,
              caixas: [
                {
                  caixa_id: 'Caixa 2',
                  produtos: ['PS5', 'Volante']
                }
              ]
            }
          ]
        }
      },
      example2: {
        summary: 'Result with product that does not fit',
        value: {
          pedidos: [
            {
              pedido_id: 1,
              caixas: [
                {
                  caixa_id: 'Caixa 1',
                  produtos: ['Smartphone']
                },
                {
                  caixa_id: null,
                  produtos: ['TV Grande'],
                  observacao: 'Produto não cabe em nenhuma caixa disponível.'
                }
              ]
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data'
  })
  processOrders(@Body() requestDto: ProcessOrdersRequestDto): ProcessOrdersResponseDto {
    const orders = requestDto.pedidos.map(pedido => 
      this.packingService.mapPedidoToOrder(pedido)
    );

    const packedOrders = this.packingService.processOrders(orders);

    const response: ProcessOrdersResponseDto = {
      pedidos: packedOrders.map(packedOrder => 
        this.packingService.mapPackedOrderToPedidoEmbalagem(packedOrder)
      )
    };

    return response;
  }
}