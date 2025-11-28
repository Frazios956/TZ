import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    findAll(paginationQuery: PaginationQueryDto): Promise<Item[]>;
}
