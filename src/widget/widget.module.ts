import { Module } from '@nestjs/common';
import { WidgetService } from './widget.service';
import {
  widgetSettingsProviders,
  visitorProviders,
  visitorSessionProviders,
} from './providers';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { organizationProviders } from '../users/providers';
import { WidgetController } from './widget.controller';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
  ],
  providers: [
    WidgetService,
    ...widgetSettingsProviders,
    ...visitorProviders,
    ...visitorSessionProviders,
    ...organizationProviders,
  ],
  controllers: [WidgetController],
})
export class WidgetModule {}
