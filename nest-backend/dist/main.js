"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const global_1 = require("./common/exception-filters/global");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new global_1.GlobalExceptionFilter());
    app.use(cookieParser());
    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ImaginaryStorage API')
        .setDescription('File storage and management API built with NestJS')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addCookieAuth('accessToken', {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'JWT token in cookie',
    })
        .addTag('Authentication', 'User authentication and authorization')
        .addTag('Users', 'User management operations')
        .addTag('Files', 'File upload, download, and management')
        .addTag('Storage', 'Storage provider management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`🚀 Server is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`❤️  Health Check: http://localhost:${port}/api/health`);
}
bootstrap();
//# sourceMappingURL=main.js.map