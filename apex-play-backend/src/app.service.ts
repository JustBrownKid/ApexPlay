import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Explore the Era of Entertainment with Apex Play';
  }
}
