import { Connection } from 'mongoose';
import { WidgetSettingsSchema } from '../schemas';

export const widgetSettingsProviders = [
  {
    provide: 'WIDGET_SETTINGS_MODEL',
    useFactory: (connection: Connection) =>
      connection.model(
        'WidgetSettings',
        WidgetSettingsSchema,
      ),
    inject: ['DATABASE_CONNECTION'],
  },
];
