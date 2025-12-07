import { Module } from '@nestjs/common';
import { WidgetService } from './widget.service';
import {
  widgetSettingsProviders,
  visitorProviders,
  visitorSessionProviders,
} from './providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    WidgetService,
    ...widgetSettingsProviders,
    ...visitorProviders,
    ...visitorSessionProviders,
  ],
})
export class WidgetModule {}
