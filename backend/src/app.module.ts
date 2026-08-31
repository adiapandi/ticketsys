import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommentsModule } from './comments/comments.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { SlaModule } from './sla/sla.module';
import { CategoriesModule } from './categories/categories.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { CannedResponsesModule } from './canned-responses/canned-responses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    NotificationsModule,
    SlaModule,
    AuditLogModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    CommentsModule,
    AttachmentsModule,
    CategoriesModule,
    CannedResponsesModule,
  ],
})
export class AppModule {}
