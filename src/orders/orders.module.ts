import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { PackingService } from './services/packing.service';

@Module({
  controllers: [OrdersController],
  providers: [PackingService],
})
export class OrdersModule {}