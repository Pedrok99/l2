import { Injectable } from '@nestjs/common';
import { Order, Product, Box, PackedOrder, PackedBox, Dimensions } from '../interfaces/order.interface';
import { PedidoDto, PedidoEmbalagemDto } from '../dto/order.dto';

@Injectable()
export class PackingService {
  private readonly availableBoxes: Box[] = [
    {
      id: 'Caixa 1',
      dimensions: { height: 30, width: 40, length: 80 },
    },
    {
      id: 'Caixa 2',
      dimensions: { height: 50, width: 50, length: 40 },
    },
    {
      id: 'Caixa 3',
      dimensions: { height: 50, width: 80, length: 60 },
    },
  ];

  processOrders(orders: Order[]): PackedOrder[] {
    return orders.map(order => this.packOrder(order));
  }

  private packOrder(order: Order): PackedOrder {
    const packedBoxes: PackedBox[] = [];
    const remainingProducts = [...order.products];

    

    while (remainingProducts.length > 0) {
      const bestFit = this.findBestBoxForProducts(remainingProducts);
      
      if (bestFit.products.length === 0) {
        packedBoxes.push({
          box_id: null,
          products: remainingProducts.map(p => p.product_id),
          observation: 'Produto não cabe em nenhuma caixa disponível.'
        });
        break;
      }

      packedBoxes.push({
        box_id: bestFit.box.id,
        products: bestFit.products.map(p => p.product_id),
      });

      bestFit.products.forEach(packedProduct => {
        const index = remainingProducts.findIndex(p => p.product_id === packedProduct.product_id);
        if (index !== -1) {
          remainingProducts.splice(index, 1);
        }
      });
    }

    return {
      order_id: order.order_id,
      boxes: packedBoxes,
    };
  }

  private findBestBoxForProducts(products: Product[]): { box: Box; products: Product[] } {
    let bestFit = { box: this.availableBoxes[0], products: [] as Product[] };

    for (const box of this.availableBoxes) {
      const fittingProducts = this.findProductsThatFitInBox(products, box);
      
      if (fittingProducts.length > bestFit.products.length) {
        bestFit = { box, products: fittingProducts };
      }
    }

    return bestFit;
  }

  private findProductsThatFitInBox(products: Product[], box: Box): Product[] {
    const fittingProducts: Product[] = [];
    let remainingVolume = this.calculateVolume(box.dimensions);

    const sortedProducts = products
      .filter(product => this.canProductFitInBox(product, box))
      .sort((a, b) => this.calculateVolume(b.dimensions) - this.calculateVolume(a.dimensions));

    for (const product of sortedProducts) {
      const productVolume = this.calculateVolume(product.dimensions);
      
      if (productVolume <= remainingVolume && this.canProductFitInBox(product, box)) {
        fittingProducts.push(product);
        remainingVolume -= productVolume;
      }
    }

    return fittingProducts;
  }

  private canProductFitInBox(product: Product, box: Box): boolean {
    const p = product.dimensions;
    const b = box.dimensions;

    const orientations = [
      [p.height, p.width, p.length],
      [p.height, p.length, p.width],
      [p.width, p.height, p.length],
      [p.width, p.length, p.height],
      [p.length, p.height, p.width],
      [p.length, p.width, p.height],
    ];

    return orientations.some(([h, w, l]) => 
      h <= b.height && w <= b.width && l <= b.length
    );
  }

  private calculateVolume(dimensions: Dimensions): number {
    return dimensions.height * dimensions.width * dimensions.length;
  }

  mapPedidoToOrder(pedidoDto: PedidoDto): Order {
    return {
      order_id: pedidoDto.pedido_id,
      products: pedidoDto.produtos.map(produto => ({
        product_id: produto.produto_id,
        dimensions: {
          height: produto.dimensoes.altura,
          width: produto.dimensoes.largura,
          length: produto.dimensoes.comprimento,
        },
      })),
    };
  }

  mapPackedOrderToPedidoEmbalagem(packedOrder: PackedOrder): PedidoEmbalagemDto {
    return {
      pedido_id: packedOrder.order_id,
      caixas: packedOrder.boxes.map(box => ({
        caixa_id: box.box_id,
        produtos: box.products,
        ...(box.observation && { observacao: box.observation })
      })),
    };
  }
}