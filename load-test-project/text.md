После запуска все сервисы будут доступны по адресам:

Frontend: http://localhost:8080

Backend API: http://localhost:3000

PostgreSQL: localhost:5432


Оптимизация backend 
В бэкенд добавьте следующие улучшения:

### backend/src/items/items.service.ts 
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async findAll(limit: number, offset: number): Promise<Item[]> {
    const cacheKey = `items_${limit}_${offset}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Use query builder for better performance
    const items = await this.itemsRepository
      .createQueryBuilder('item')
      .orderBy('item.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    // Cache the result
    cache.set(cacheKey, {
      data: items,
      timestamp: Date.now()
    });

    return items;
  }

  async getCount(): Promise<number> {
    return this.itemsRepository.count();
  }

  // Clear cache method (optional)
  clearCache(): void {
    cache.clear();
  }
}
