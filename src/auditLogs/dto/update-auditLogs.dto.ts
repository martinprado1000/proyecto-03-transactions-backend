import { PartialType } from '@nestjs/swagger';
import { CreateAuditLogsDto } from './create-auditLogs.dto';

export class UpdateAuditLogsDto extends PartialType(CreateAuditLogsDto) {}
