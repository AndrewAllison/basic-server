import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './modules/config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
