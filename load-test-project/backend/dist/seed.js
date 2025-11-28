"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const item_entity_1 = require("./items/entities/item.entity");
async function seed() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'db',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'test',
        entities: [item_entity_1.Item],
        synchronize: true,
    });
    await dataSource.initialize();
    const itemRepository = dataSource.getRepository(item_entity_1.Item);
    const count = await itemRepository.count();
    if (count > 0) {
        console.log('Database already seeded');
        await dataSource.destroy();
        return;
    }
    console.log('Seeding database with 50,000 items...');
    const batchSize = 1000;
    const totalItems = 50000;
    for (let i = 0; i < totalItems; i += batchSize) {
        const items = [];
        for (let j = 0; j < batchSize && i + j < totalItems; j++) {
            items.push({
                name: `Item ${i + j + 1}`,
            });
        }
        await itemRepository.save(items);
        console.log(`Created ${Math.min(i + batchSize, totalItems)} items...`);
    }
    console.log('Seeding completed!');
    await dataSource.destroy();
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map