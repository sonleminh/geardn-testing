import { Module, Global } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Global() // Quan trọng: Giúp module này dùng được ở mọi nơi mà không cần import lại nhiều lần
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders], // Export để bên ngoài dùng được
})
export class DatabaseModule {}
