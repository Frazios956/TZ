"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    }));
    app.enableCors({
        origin: ['http://localhost:8080', 'http://localhost:3000', 'http://frontend:80'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    await app.listen(3000, '0.0.0.0');
    console.log('Application is running on: http://0.0.0.0:3000');
}
bootstrap();
//# sourceMappingURL=main.js.map