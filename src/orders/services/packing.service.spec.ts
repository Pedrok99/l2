import { Test, TestingModule } from '@nestjs/testing';
import { PackingService } from './packing.service';
import { Order, PackedOrder } from '../interfaces/order.interface';

describe('PackingService', () => {
  let service: PackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackingService],
    }).compile();

    service = module.get<PackingService>(PackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processOrders', () => {
    it('should process multiple orders', () => {
      const orders: Order[] = [
        {
          order_id: 1,
          products: [
            {
              product_id: 'small-item',
              dimensions: { height: 10, width: 10, length: 10 }
            }
          ]
        },
        {
          order_id: 2,
          products: [
            {
              product_id: 'medium-item',
              dimensions: { height: 20, width: 20, length: 20 }
            }
          ]
        }
      ];

      const result = service.processOrders(orders);

      expect(result).toHaveLength(2);
      expect(result[0].order_id).toBe(1);
      expect(result[1].order_id).toBe(2);
    });
  });

  describe('packing algorithm', () => {
    it('should pack small products into Caixa 1', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'PS5',
            dimensions: { height: 10, width: 15, length: 20 }
          },
          {
            product_id: 'Controller',
            dimensions: { height: 5, width: 10, length: 15 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].box_id).toBe('Caixa 1');
      expect(result.boxes[0].products).toContain('PS5');
      expect(result.boxes[0].products).toContain('Controller');
    });

    it('should pack medium products into appropriate box', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'Medium-Box',
            dimensions: { height: 40, width: 40, length: 30 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].box_id).not.toBeNull();
      expect(result.boxes[0].products).toContain('Medium-Box');
    });

    it('should pack large products into Caixa 3', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'Large-Item',
            dimensions: { height: 45, width: 70, length: 50 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].box_id).toBe('Caixa 3');
      expect(result.boxes[0].products).toContain('Large-Item');
    });

    it('should handle products that do not fit in any box', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'Too-Large',
            dimensions: { height: 100, width: 100, length: 100 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].box_id).toBeNull();
      expect(result.boxes[0].products).toContain('Too-Large');
      expect(result.boxes[0].observation).toBe('Produto não cabe em nenhuma caixa disponível.');
    });

    it('should optimize packing by using fewest boxes', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'Item1',
            dimensions: { height: 10, width: 10, length: 10 }
          },
          {
            product_id: 'Item2',
            dimensions: { height: 10, width: 10, length: 10 }
          },
          {
            product_id: 'Item3',
            dimensions: { height: 10, width: 10, length: 10 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].products).toHaveLength(3);
    });

    it('should handle mixed products that require multiple boxes', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'Small1',
            dimensions: { height: 10, width: 10, length: 10 }
          },
          {
            product_id: 'Large1',
            dimensions: { height: 45, width: 70, length: 50 }
          },
          {
            product_id: 'TooLarge',
            dimensions: { height: 100, width: 100, length: 100 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes.length).toBeGreaterThanOrEqual(2);
      
      const validBoxes = result.boxes.filter(box => box.box_id !== null);
      const invalidBoxes = result.boxes.filter(box => box.box_id === null);
      
      expect(validBoxes.length).toBeGreaterThanOrEqual(1);
      expect(invalidBoxes.length).toBe(1);
      expect(invalidBoxes[0].products).toContain('TooLarge');
    });
  });

  describe('product rotation logic', () => {
    it('should rotate products to fit in boxes', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'Rotatable',
            dimensions: { height: 80, width: 30, length: 20 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].box_id).toBe('Caixa 1');
      expect(result.boxes[0].products).toContain('Rotatable');
    });
  });

  describe('mapPedidoToOrder', () => {
    it('should map Portuguese DTO to English interface', () => {
      const pedidoDto = {
        pedido_id: 123,
        produtos: [
          {
            produto_id: 'TEST-PRODUCT',
            dimensoes: {
              altura: 10,
              largura: 20,
              comprimento: 30
            }
          }
        ]
      };

      const result = service.mapPedidoToOrder(pedidoDto);

      expect(result.order_id).toBe(123);
      expect(result.products).toHaveLength(1);
      expect(result.products[0].product_id).toBe('TEST-PRODUCT');
      expect(result.products[0].dimensions.height).toBe(10);
      expect(result.products[0].dimensions.width).toBe(20);
      expect(result.products[0].dimensions.length).toBe(30);
    });
  });

  describe('mapPackedOrderToPedidoEmbalagem', () => {
    it('should map English interface to Portuguese DTO', () => {
      const packedOrder: PackedOrder = {
        order_id: 456,
        boxes: [
          {
            box_id: 'Caixa 1',
            products: ['PROD1', 'PROD2']
          }
        ]
      };

      const result = service.mapPackedOrderToPedidoEmbalagem(packedOrder);

      expect(result.pedido_id).toBe(456);
      expect(result.caixas).toHaveLength(1);
      expect(result.caixas[0].caixa_id).toBe('Caixa 1');
      expect(result.caixas[0].produtos).toEqual(['PROD1', 'PROD2']);
    });

    it('should include observation when box_id is null', () => {
      const packedOrder: PackedOrder = {
        order_id: 789,
        boxes: [
          {
            box_id: null,
            products: ['TOO-BIG'],
            observation: 'Produto não cabe em nenhuma caixa disponível.'
          }
        ]
      };

      const result = service.mapPackedOrderToPedidoEmbalagem(packedOrder);

      expect(result.pedido_id).toBe(789);
      expect(result.caixas).toHaveLength(1);
      expect(result.caixas[0].caixa_id).toBeNull();
      expect(result.caixas[0].produtos).toEqual(['TOO-BIG']);
      expect(result.caixas[0]).toHaveProperty('observacao');
    });
  });

  describe('edge cases', () => {
    it('should handle empty product list', () => {
      const order: Order = {
        order_id: 1,
        products: []
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(0);
    });

    it('should handle single product that fits exactly', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'ExactFit',
            dimensions: { height: 30, width: 40, length: 80 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].box_id).toBe('Caixa 1');
      expect(result.boxes[0].products).toContain('ExactFit');
    });

    it('should handle product that is slightly too big for all boxes', () => {
      const order: Order = {
        order_id: 1,
        products: [
          {
            product_id: 'SlightlyTooBig',
            dimensions: { height: 51, width: 81, length: 61 }
          }
        ]
      };

      const result = service.processOrders([order])[0];

      expect(result.boxes).toHaveLength(1);
      expect(result.boxes[0].box_id).toBeNull();
      expect(result.boxes[0].products).toContain('SlightlyTooBig');
      expect(result.boxes[0].observation).toBe('Produto não cabe em nenhuma caixa disponível.');
    });
  });
});