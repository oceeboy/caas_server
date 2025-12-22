import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import {
  UserDocument,
  OrganizationDocument,
} from './schemas';
import {
  LoginDto,
  RegisterAgentDto,
  RegisterOrgDto,
} from './dtos';
import * as crypto from 'crypto';
import * as argon from 'argon2';
import { WidgetSettingsDocument } from '../widget/schemas';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<UserDocument>,
    @Inject('ORGANIZATION_MODEL')
    private organizationModel: Model<OrganizationDocument>,
    @Inject('WIDGET_SETTINGS_MODEL')
    private widgetSettingsModel: Model<WidgetSettingsDocument>,
  ) {}

  // utility to generate API key
  private generateApiKey(): string {
    // 32 bytes -> 64 hex chars; prefix for org scoping
    const raw = crypto
      .randomBytes(32)
      .toString('hex');
    return `org_${raw}`;
  }

  // utility to normalize email
  private normalizeEmail(email: string) {
    if (
      typeof email !== 'string' ||
      email.trim().length === 0
    ) {
      throw new BadRequestException(
        'Email is required',
      );
    }
    return email.trim().toLowerCase();
  }

  // register organization (creates org + admin user)
  async registerOrganization(
    dto: RegisterOrgDto,
  ) {
    const orgName = dto.orgName?.trim();
    const adminName = dto.adminName?.trim();
    const adminEmail = dto.adminEmail
      ?.trim()
      .toLowerCase();

    const existingAdmin = await this.userModel
      .findOne({ email: adminEmail })
      .lean();
    if (existingAdmin)
      throw new ConflictException(
        'Organization email already exists',
      );

    // Create org via save to avoid TS overload confusion
    const orgDoc = new this.organizationModel({
      name: orgName,
      apiKey: this.generateApiKey(),
    });
    const org =
      (await orgDoc.save()) as OrganizationDocument;

    // create default widget settings for org
    const widgetSettingsDoc =
      new this.widgetSettingsModel({
        orgId: org._id,
        // themeColor: '#000000',
        // welcomeMessage:
        //   'Welcome to our chat!',
        // offlineMessage:
        //   'We are currently offline. Please leave a message.',
      });
    await widgetSettingsDoc.save();

    const hash = await argon.hash(dto.password);
    const adminDoc = new this.userModel({
      orgId: org._id,
      name: adminName,
      email: adminEmail,
      password: hash,
      role: 'admin',
    });
    const admin =
      (await adminDoc.save()) as UserDocument;

    // return {
    //   orgId: String(org._id),
    //   adminId: String(admin._id),
    // };

    return admin;
  }

  // register agent example orgId: 6934af6aed1e1953ef393fe4
  async registerAgent(dto: RegisterAgentDto) {
    const { orgId, name, email, password } = dto;
    const normalizedEmail =
      this.normalizeEmail(email);

    const orgExists =
      await this.organizationModel.exists({
        _id: new Types.ObjectId(orgId),
      });
    if (!orgExists)
      throw new BadRequestException(
        'Organization not found',
      );

    const exists = await this.userModel
      .findOne({ email: normalizedEmail })
      .lean();
    if (exists)
      throw new ConflictException(
        'Agent email already exists',
      );

    const hash = await argon.hash(password);
    const agentDoc = new this.userModel({
      orgId: new Types.ObjectId(orgId),
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      role: 'agent',
    });
    const agent =
      (await agentDoc.save()) as UserDocument;

    return { agentId: String(agent._id) };
  }

  // find user by email
  async findByEmail(email: string) {
    return this.userModel
      .findOne({
        email: this.normalizeEmail(email),
      })
      .lean();
  }

  // validate user login
  async validateLogin(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userModel
      .findOne({
        email: this.normalizeEmail(email),
      })
      .select('+password');
    if (!user)
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    const ok = await argon.verify(
      user.password,
      password,
    );
    if (!ok)
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      role: user.role,
    };
  }

  // get user profile
  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .lean();
    if (!user)
      throw new BadRequestException(
        'User not found',
      );
    // omit sensitive fields
    const { password, ...rest } = user as any;
    return rest;
  }

  // update user profile (name/email/password)
  async updateProfile(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      password?: string;
    },
  ) {
    const payload: any = {};
    if (updates.name)
      payload.name = updates.name.trim();
    if (updates.email) {
      const normalizedEmail = this.normalizeEmail(
        updates.email,
      );
      const clash = await this.userModel
        .findOne({
          email: normalizedEmail,
          _id: { $ne: userId },
        })
        .lean();
      if (clash)
        throw new ConflictException(
          'Email already in use',
        );
      payload.email = normalizedEmail;
    }
    if (updates.password)
      payload.password = await argon.hash(
        updates.password,
      );

    const updated = await this.userModel
      .findByIdAndUpdate(userId, payload, {
        new: true,
      })
      .lean();
    if (!updated)
      throw new BadRequestException(
        'User not found',
      );
    const { password, ...rest } = updated as any;
    return rest;
  }
}
