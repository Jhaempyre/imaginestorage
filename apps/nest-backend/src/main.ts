import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/exception-filters/global";
import { AppLogger } from "./common/utils/logger";
import { LoggingInterceptor } from "./common/interceptor/logger.interceptor";
import { CorsConfig } from "./common/config/cors.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  // Global logger
  app.useLogger(app.get(AppLogger));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(AppLogger)));

  // Cookie parser
  app.use(cookieParser());

  // This solved the CORS issues for upload routes
  // By handling OPTIONS preflight here with permissive headers
  // for specific routes
  // app.use((req, res, next) => {
  //   // Check if this is an upload route
  //   if (req.path.includes("/upload")) {
  //     // Set permissive CORS headers for upload routes
  //     res.header("Access-Control-Allow-Origin", "*");
  //     res.header("Access-Control-Allow-Headers", "*");
  //     res.header("Access-Control-Allow-Methods", "*");
  //     res.header("Access-Control-Allow-Credentials", "false");

  //     // Handle OPTIONS preflight immediately
  //     if (req.method === "OPTIONS") {
  //       console.log("✅ Handling OPTIONS for upload route:", req.path);
  //       return res.status(204).end();
  //     }
  //   }

  //   // For non-upload routes, continue to global CORS
  //   next();
  // });

  // // CORS configuration
  // app.enableCors({
  //   origin: [
  //     "http://localhost:3000",
  //     "http://localhost:8080",
  //     "http://127.0.0.1:8080",
  //     "http://localhost:5173",
  //     ...(configService.get("CORS_ORIGIN")?.split(",") || []),
  //   ],
  //   credentials: true,
  //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  //   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  // });

  CorsConfig.configureApp(app, configService);

  // Global prefix
  app.setGlobalPrefix("api");

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("ImaginaryStorage API")
    .setDescription("File storage and management API built with NestJS")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addCookieAuth("accessToken", {
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
      description: "JWT token in cookie",
    })
    .addTag("Authentication", "User authentication and authorization")
    .addTag("Users", "User management operations")
    .addTag("Files", "File upload, download, and management")
    .addTag("Storage", "Storage provider management")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get("PORT") || 8000;
  await app.listen(port);

  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${port}/api/health`);  
}

bootstrap();
