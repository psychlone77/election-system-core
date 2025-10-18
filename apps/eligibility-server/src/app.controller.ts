import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type {
  RegisterDto,
  RequestTokenDto,
  ServerCheck,
} from '@election-system-core/shared/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getCheck(): ServerCheck {
    return this.appService.getCheck();
  }

  @Get('eligible-voters')
  getEligibleVoters() {
    return this.appService.getEligibleVoters();
  }

  @Get('public-key')
  async getPublicKey() {
    return (await this.appService.getPublicKey()).publicPem;
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { NIC, registration_code, public_key } = body;
    return this.appService.registerVoter(NIC, registration_code, public_key);
  }

  @Post('request-token')
  async requestToken(@Body() body: RequestTokenDto) {
    const { NIC, blinded_token, signature } = body;
    return this.appService.requestToken(NIC, blinded_token, signature);
  }
}
