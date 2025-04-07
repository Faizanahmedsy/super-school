import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "body-parser";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { CustomExceptionFilter } from "./exceptions.filter";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { PostgresConfigService } from "./config/postgres/config.service";
import * as express from "express";
import * as exphbs from "express-handlebars";
import { join } from "path";
import { IoAdapter } from "@nestjs/platform-socket.io";
import * as path from "path";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
const fs = require("fs");

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
        cors: true,
    });

    const appConfig = app.get(PostgresConfigService);

    const expressApp = app.getHttpAdapter().getInstance();

    app.use("/public", express.static(join(__dirname, "..", "public")));

    // expressApp.set("views", join(__dirname, "..", "views"));
    // expressApp.set("view engine", "hbs");

    // expressApp.engine(
    //     "hbs",
    //     exphbs.engine({
    //         extname: "hbs",
    //         partialsDir: join(__dirname, "..", "views", "partials"),
    //         defaultLayout: false,
    //     })
    // );

    // console.log("Partials directory:", join(__dirname, "..", "views", "partials"));

    // console.log("Header Partial Exists:", fs.existsSync(join(__dirname, "..", "views", "partials", "header.hbs")));
    // console.log("Footer Partial Exists:", fs.existsSync(join(__dirname, "..", "views", "partials", "footer.hbs")));

    const uploadPath = join(__dirname, "..", "uploads");
    expressApp.use("/uploads", express.static(uploadPath));

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    app.use(json());
    app.use(urlencoded({ extended: true }));

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new CustomExceptionFilter());

    app.setGlobalPrefix("api/v1");
    app.enableCors({
        origin: "*",
    });

    const config = new DocumentBuilder().addBearerAuth().setTitle("My API").setDescription("API Documentation").setVersion("1.0").build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    Object.keys(document.paths).forEach((path) => {
        const pathItem = document.paths[path];
        Object.keys(pathItem).forEach((method) => {
            const operation = pathItem[method];
            if (!operation.parameters) {
                operation.parameters = [];
            }
            operation.parameters.push({
                name: "language_code",
                in: "header",
                required: true,
                schema: {
                    type: "string",
                    example: "en",
                },
                description: "The language code for localization (e.g., en, af, zu)",
            });
        });
    });

    app.useWebSocketAdapter(new IoAdapter(app));
    // app.useGlobalGuards(new JwtAuthGuard());

    const port = appConfig.port;

    await app.listen(port);
}

bootstrap();
