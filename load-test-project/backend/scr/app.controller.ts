import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/items?limit=10')
  redirectToItems() {
    
  }

  @Get('health')
  healthCheck() {
    return { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Load Test Backend'
    };
  }
}