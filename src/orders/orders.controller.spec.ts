import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { PackingService } from './services/packing.service';
import { ProcessOrdersRequestDto } from './dto/process-orders-request.dto';
import { ProcessOrdersResponseDto } from './dto/process-orders-response.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let packingService: PackingService;

  const mockPackingService = {
    mapPedidoToOrder: jest.fn(),
    processOrders: jest.fn(),
    mapPackedOrderToPedidoEmbalagem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: PackingService,
          useValue: mockPackingService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    packingService = module.get<PackingService>(PackingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('processOrders', () => {
    it('should process orders and return packed results', () => {
      const requestDto: ProcessOrdersRequestDto = {
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
              }
            ]
          }
        ]
      };

      const mappedOrder = {
        order_id: 1,
        products: [
          {
            product_id: 'PS5',
            dimensions: {
              height: 40,
              width: 10,
              length: 25
            }
          }
        ]
      };

      const packedOrder = {
        order_id: 1,
        boxes: [
          {
            box_id: 'Caixa 2',
            products: ['PS5']
          }
        ]
      };

      const expectedResponse = {
        pedido_id: 1,
        caixas: [
          {
            caixa_id: 'Caixa 2',
            produtos: ['PS5']
          }
        ]
      };

      mockPackingService.mapPedidoToOrder.mockReturnValue(mappedOrder);
      mockPackingService.processOrders.mockReturnValue([packedOrder]);
      mockPackingService.mapPackedOrderToPedidoEmbalagem.mockReturnValue(expectedResponse);

      const result: ProcessOrdersResponseDto = controller.processOrders(requestDto);

      expect(mockPackingService.mapPedidoToOrder).toHaveBeenCalledWith(requestDto.pedidos[0]);
      expect(mockPackingService.processOrders).toHaveBeenCalledWith([mappedOrder]);
      expect(mockPackingService.mapPackedOrderToPedidoEmbalagem).toHaveBeenCalledWith(packedOrder);

      expect(result.pedidos).toHaveLength(1);
      expect(result.pedidos[0]).toEqual(expectedResponse);
    });

    it('should handle multiple orders', () => {
      const requestDto: ProcessOrdersRequestDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: [
              {
                produto_id: 'Item1',
                dimensoes: { altura: 10, largura: 10, comprimento: 10 }
              }
            ]
          },
          {
            pedido_id: 2,
            produtos: [
              {
                produto_id: 'Item2',
                dimensoes: { altura: 20, largura: 20, comprimento: 20 }
              }
            ]
          }
        ]
      };

      const mappedOrders = [
        {
          order_id: 1,
          products: [{ product_id: 'Item1', dimensions: { height: 10, width: 10, length: 10 } }]
        },
        {
          order_id: 2,
          products: [{ product_id: 'Item2', dimensions: { height: 20, width: 20, length: 20 } }]
        }
      ];

      const packedOrders = [
        {
          order_id: 1,
          boxes: [{ box_id: 'Caixa 1', products: ['Item1'] }]
        },
        {
          order_id: 2,
          boxes: [{ box_id: 'Caixa 2', products: ['Item2'] }]
        }
      ];

      const expectedResponses = [
        {
          pedido_id: 1,
          caixas: [{ caixa_id: 'Caixa 1', produtos: ['Item1'] }]
        },
        {
          pedido_id: 2,
          caixas: [{ caixa_id: 'Caixa 2', produtos: ['Item2'] }]
        }
      ];

      mockPackingService.mapPedidoToOrder
        .mockReturnValueOnce(mappedOrders[0])
        .mockReturnValueOnce(mappedOrders[1]);
      mockPackingService.processOrders.mockReturnValue(packedOrders);
      mockPackingService.mapPackedOrderToPedidoEmbalagem
        .mockReturnValueOnce(expectedResponses[0])
        .mockReturnValueOnce(expectedResponses[1]);

      const result: ProcessOrdersResponseDto = controller.processOrders(requestDto);

      expect(mockPackingService.mapPedidoToOrder).toHaveBeenCalledTimes(2);
      expect(mockPackingService.processOrders).toHaveBeenCalledWith(mappedOrders);
      expect(mockPackingService.mapPackedOrderToPedidoEmbalagem).toHaveBeenCalledTimes(2);

      expect(result.pedidos).toHaveLength(2);
      expect(result.pedidos[0]).toEqual(expectedResponses[0]);
      expect(result.pedidos[1]).toEqual(expectedResponses[1]);
    });

    it('should handle orders with products that do not fit', () => {
      const requestDto: ProcessOrdersRequestDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: [
              {
                produto_id: 'TooLarge',
                dimensoes: {
                  altura: 100,
                  largura: 100,
                  comprimento: 100
                }
              }
            ]
          }
        ]
      };

      const mappedOrder = {
        order_id: 1,
        products: [
          {
            product_id: 'TooLarge',
            dimensions: {
              height: 100,
              width: 100,
              length: 100
            }
          }
        ]
      };

      const packedOrder = {
        order_id: 1,
        boxes: [
          {
            box_id: null,
            products: ['TooLarge'],
            observation: 'Produto não cabe em nenhuma caixa disponível.'
          }
        ]
      };

      const expectedResponse = {
        pedido_id: 1,
        caixas: [
          {
            caixa_id: null,
            produtos: ['TooLarge'],
            observacao: 'Produto não cabe em nenhuma caixa disponível.'
          }
        ]
      };

      mockPackingService.mapPedidoToOrder.mockReturnValue(mappedOrder);
      mockPackingService.processOrders.mockReturnValue([packedOrder]);
      mockPackingService.mapPackedOrderToPedidoEmbalagem.mockReturnValue(expectedResponse);

      const result: ProcessOrdersResponseDto = controller.processOrders(requestDto);

      expect(result.pedidos).toHaveLength(1);
      expect(result.pedidos[0].caixas[0].caixa_id).toBeNull();
      expect(result.pedidos[0].caixas[0]).toHaveProperty('observacao');
      expect(result.pedidos[0].caixas[0].observacao).toBe('Produto não cabe em nenhuma caixa disponível.');
    });

    it('should handle empty orders list', () => {
      const requestDto: ProcessOrdersRequestDto = {
        pedidos: []
      };

      mockPackingService.processOrders.mockReturnValue([]);

      const result: ProcessOrdersResponseDto = controller.processOrders(requestDto);

      expect(mockPackingService.processOrders).toHaveBeenCalledWith([]);
      expect(result.pedidos).toHaveLength(0);
    });

    it('should handle orders with no products', () => {
      const requestDto: ProcessOrdersRequestDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: []
          }
        ]
      };

      const mappedOrder = {
        order_id: 1,
        products: []
      };

      const packedOrder = {
        order_id: 1,
        boxes: []
      };

      const expectedResponse = {
        pedido_id: 1,
        caixas: []
      };

      mockPackingService.mapPedidoToOrder.mockReturnValue(mappedOrder);
      mockPackingService.processOrders.mockReturnValue([packedOrder]);
      mockPackingService.mapPackedOrderToPedidoEmbalagem.mockReturnValue(expectedResponse);

      const result: ProcessOrdersResponseDto = controller.processOrders(requestDto);

      expect(result.pedidos).toHaveLength(1);
      expect(result.pedidos[0].caixas).toHaveLength(0);
    });

    it('should preserve order IDs through the processing pipeline', () => {
      const requestDto: ProcessOrdersRequestDto = {
        pedidos: [
          {
            pedido_id: 999,
            produtos: [
              {
                produto_id: 'TestProduct',
                dimensoes: { altura: 1, largura: 1, comprimento: 1 }
              }
            ]
          }
        ]
      };

      const mappedOrder = {
        order_id: 999,
        products: [{ product_id: 'TestProduct', dimensions: { height: 1, width: 1, length: 1 } }]
      };

      const packedOrder = {
        order_id: 999,
        boxes: [{ box_id: 'Caixa 1', products: ['TestProduct'] }]
      };

      const expectedResponse = {
        pedido_id: 999,
        caixas: [{ caixa_id: 'Caixa 1', produtos: ['TestProduct'] }]
      };

      mockPackingService.mapPedidoToOrder.mockReturnValue(mappedOrder);
      mockPackingService.processOrders.mockReturnValue([packedOrder]);
      mockPackingService.mapPackedOrderToPedidoEmbalagem.mockReturnValue(expectedResponse);

      const result: ProcessOrdersResponseDto = controller.processOrders(requestDto);

      expect(result.pedidos[0].pedido_id).toBe(999);
    });
  });
});