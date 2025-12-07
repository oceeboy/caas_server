import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { OrganizationDocument } from 'src/users/schemas';
import {
  VisitorDocument,
  VisitorSessionDocument,
  WidgetSettingsDocument,
} from './schemas';
import { WidgetAuthDto } from './dtos';

@Injectable()
export class WidgetService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    @Inject('ORGANIZATION_MODEL')
    private organizationModel: Model<OrganizationDocument>,
    @Inject('WIDGET_SETTINGS_MODEL')
    private widgetSettingsModel: Model<WidgetSettingsDocument>,
    @Inject('VISITOR_MODEL')
    private visitorModel: Model<VisitorDocument>,
    @Inject('VISITOR_SESSION_MODEL')
    private visitorSessionModel: Model<VisitorSessionDocument>,
  ) {}

  private readonly logger = new Logger(
    WidgetService.name,
  );

  // widget authentication for visitors
  async authenticateVisitor(
    dto: WidgetAuthDto,
    ip: string,
    userAgent?: string,
  ) {
    // parse dto
    const { apiKey, browserId, pageUrl } = dto;

    // find organization by apiKey
    const organization =
      await this.organizationModel.findOne({
        apiKey,
      });
    if (!organization) {
      throw new UnauthorizedException(
        'Invalid API key',
      );
    }
    this.logger.debug(
      'Widget authentication called with DTO:',
      dto,
    );
    // create or find visitor and session logic to be implemented

    return {
      organizationData: organization,
      headerDetails: {
        ip,
        userAgent,
      },
      message:
        'Widget authentication not yet implemented',
      subNote:
        'Visitor and session creation logic is pending',
      testNote: `Received browserId: ${browserId}, pageUrl: ${pageUrl}`,
    };
  }
}
