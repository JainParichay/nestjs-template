import { Controller, Get } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { HealthService, HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly logger: Logger,
  ) {}

  @Get('logs')
  async getLogs() {
    return this.healthService.getLogs();
  }

  @Get()
  async checkHealth(): Promise<HealthStatus> {
    return this.healthService.checkHealth();
  }
}
