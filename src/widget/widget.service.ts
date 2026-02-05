import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';

import { OrganizationDocument } from 'src/users/schemas';
import {
  VisitorDocument,
  VisitorSessionDocument,
  WidgetSettingsDocument,
} from './schemas';
import { WidgetAuthDto } from './dtos';
import { ConversationsService } from '../conversations/conversations.service';

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
    private readonly visitorModel: Model<VisitorDocument>,
    @Inject('VISITOR_SESSION_MODEL')
    private visitorSessionModel: Model<VisitorSessionDocument>,
    private readonly conversationService: ConversationsService,
  ) {}

  private readonly logger = new Logger(
    WidgetService.name,
  );

  private convertTypesObjectIdToString(
    obj: any,
  ): any {
    if (obj instanceof Types.ObjectId) {
      return obj.toString();
    } else if (Array.isArray(obj)) {
      return obj.map((item) =>
        this.convertTypesObjectIdToString(item),
      );
    } else if (
      typeof obj === 'object' &&
      obj !== null
    ) {
      const newObj = {};
      for (const key in obj) {
        newObj[key] =
          this.convertTypesObjectIdToString(
            obj[key],
          );
      }
      return newObj;
    }
    return obj;
  }

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
        'Invalid API keys provided',
      );
    }

    // this.logger.debug(
    //   'Widget authentication called with DTO:',
    //   dto,
    // );
    // create or find visitor and session logic to be implemented

    /**
     * this visitor logic to find is not as proper as seems
     * but there was a type error that wasnt resolving
     * which made me use this so if there should a work in the section later
     * i oceeboi was the one who wrote this patch for production to flow
     */
    let visitor = await this.visitorModel
      .findOne()
      .where('orgId')
      .equals(organization._id)
      .where('browserId')
      .equals(browserId);
    // if not available create account
    if (!visitor) {
      visitor = await this.visitorModel.create({
        orgId: organization._id,
        browserId,
        lastSeenAt: new Date(),
        ipAddress: ip,
      });
    } else {
      visitor.lastSeenAt = new Date();
      visitor.ipAddress = ip;
      await visitor.save();
    }

    const conversation =
      await this.conversationService.startConversation(
        {
          visitorId:
            this.convertTypesObjectIdToString(
              visitor._id,
            ),
          orgId:
            this.convertTypesObjectIdToString(
              organization._id,
            ),
        },
      );

    console.log(
      'Conversation started:',
      conversation,
    );

    /***
     * ##################################################
     * there is no need to check for a session already existing
     * each authentication call should create a new session
     * so no check for existing session is implemented here
     *##################################################
     * guidline by oceeboi reasons why this is so is because
     * each page load or visit should be a new session
     * and sessions are not to be reused
     */
    const session =
      await this.visitorSessionModel.create({
        orgId: organization._id,
        visitorId: visitor._id,
        ipAddress: ip,
        userAgent,
        pageUrl,
      });

    // this.logger.debug(
    //   'Visitor session created:',
    //   session,
    // );

    // ##### create a jwt payload ####

    const payload = {
      sub: String(visitor._id),
      orgId: String(organization._id),
      sessionId: String(session._id),
      role: 'visitor',
      // browserId,
    };

    // get widget settings for organization

    const widgetSettings =
      await this.getWidgetSettings(
        organization._id,
      );

    const token = this.jwt.sign(payload, {
      expiresIn: '1h',
      secret: this.config.get(
        'VISITOR_JWT_SECRET',
      ),
    });

    // there needs to be a refresh token will be implemented later
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '7d',
      secret: this.config.get(
        'VISITOR_JWT_SECRET',
      ),
    });

    // return {
    //   token,
    //   // organizationData: organization,
    //   // headerDetails: {
    //   //   ip,
    //   //   userAgent,
    //   // },
    //   // setting: widgetSettings,
    //   message:
    //     'Widget authentication not yet implemented',
    //   subNote:
    //     'Visitor and session creation logic is pending',
    //   testNote: `Received browserId: ${browserId}, pageUrl: ${pageUrl}`,
    // };

    return {
      widgetToken: token,
      conversationId: conversation.conversationId,
      visitorId: visitor._id.toString(),
    };
  }
  getStatus() {
    return {
      status: 'ok',
      message: 'Widget service is running',
    };
  }
  // get widget settings for organization
  async getWidgetSettings(orgId: Types.ObjectId) {
    const settings =
      await this.widgetSettingsModel.findOne({
        orgId,
      });
    if (!settings) {
      throw new UnauthorizedException(
        'Widget settings not found for organization',
      );
    }

    return settings;
  }
}
