import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { AiModule } from "./modules/ai/ai.module";
import { TechnologiesModule } from "./modules/technologies/technologies.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { HistoryModule } from "./modules/history/history.module";
import { BookmarksModule } from "./modules/bookmarks/bookmarks.module";
import { StatsModule } from "./modules/stats/stats.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AiModule,
    TechnologiesModule,
    SessionsModule,
    HistoryModule,
    BookmarksModule,
    StatsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
