import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient, RedisClientType } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter, RedisAdapter } from '@socket.io/redis-adapter';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: RedisAdapter | null = null;
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;

  async connectToRedis(): Promise<void> {
    const redisHost: string = process.env.REDIS_HOST || 'redis';

    this.pubClient = createClient({
      url: `redis://${redisHost}:6379`,
      password: 'redissenha123',
    });

    this.subClient = this.pubClient.duplicate();

    await Promise.all([
      this.pubClient.connect(),
      this.subClient.connect(),
    ]);

    if (this.pubClient && this.subClient) {
      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}