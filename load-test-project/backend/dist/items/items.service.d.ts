import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
export declare class ItemsService {
    private readonly itemsRepository;
    constructor(itemsRepository: Repository<Item>);
    findAll(limit: number, offset: number): Promise<Item[]>;
    getCount(): Promise<number>;
}
