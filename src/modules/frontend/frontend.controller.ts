import { Get, Controller, Render, UseGuards, Req, Res } from '@nestjs/common';
import { LogtoAuthGuard } from '../../guards/logto-auth.guard';
import { Request, Response } from 'express';

@Controller()
export class FrontendController {
  constructor() {}

  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  @Get('profile')
  @UseGuards(LogtoAuthGuard)
  profile(@Req() req: Request, @Res() res: Response) {
    res.json(req.session);
  }
}
