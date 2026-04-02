import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",") : true,
    credentials: true,
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  const port = parseInt(process.env.PORT || "3001", 10);
  await app.listen(port);

  console.log(`API running on http://localhost:${port}/api`);
};

bootstrap().catch((error) => {
  console.error("Nest bootstrap error:", error);
  process.exit(1);
});
