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

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async findAll(limit: number, offset: number): Promise<Item[]> {
    return this.itemsRepository.find({
      take: limit,
      skip: offset,
      order: { id: 'ASC' },
    });
  }

  async getCount(): Promise<number> {
    return this.itemsRepository.count();
  }
}
