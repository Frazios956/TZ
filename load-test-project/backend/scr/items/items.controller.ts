import { Controller, Get, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto): Promise<Item[]> {
   
    const limit = paginationQuery.limit ?? 100; 
    const offset = paginationQuery.offset ?? 0;  
    
    return this.itemsService.findAll(limit, offset);
  }
}