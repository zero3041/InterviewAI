import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { client, db } from "./index";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db = db;

  async onModuleDestroy() {
    await client.end();
  }
}
