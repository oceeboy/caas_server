import { AuthGuard } from '@nestjs/passport';

export class WidgetGuard extends AuthGuard(
  'jwt-widget',
) {
  constructor() {
    super();
  }
}
