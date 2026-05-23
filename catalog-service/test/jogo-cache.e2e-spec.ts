import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JogoCacheService } from '../src/domain/jogo/services/jogo-cache.service';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { createClient, RedisClientType } from 'redis';

describe('JogoCacheService com Testcontainers (Integração)', () => {
  let redisContainer: StartedRedisContainer;
  let cacheService: JogoCacheService;
  let moduleRef: TestingModule;
  let redisClient: RedisClientType;

  beforeAll(async () => {
    console.log('Subindo container isolado do Redis via Testcontainers...');
    
    redisContainer = await new RedisContainer('redis:7-alpine').start();
    
    const host = redisContainer.getHost();
    const port = redisContainer.getMappedPort(6379);
    const connectionString = `redis://${host}:${port}`;

    moduleRef = await Test.createTestingModule({
      providers: [JogoCacheService],
    }).compile();

    cacheService = moduleRef.get<JogoCacheService>(JogoCacheService);

    redisClient = createClient({ url: connectionString }) as RedisClientType;
    await redisClient.connect();
    
    (cacheService as any).client = redisClient;
    
    console.log(`✅ Testcontainers pronto e conectado em: ${connectionString}`);
  }, 45000);

  // O NestJS vai gerenciar o encerramento do cliente de forma isolada
  afterAll(async () => {
    if (cacheService) {
      await cacheService.onModuleDestroy(); // Isso desliga o cliente Redis internamente
    }
    if (redisContainer) {
      await redisContainer.stop();
      console.log('Container temporário do Redis destruído com sucesso!');
    }
  });

  it('CacheAside_DeveFazerHitNaSegundaLeitura', async () => {
    const jogoId = 'bbb11111-1111-1111-1111-111111111111';
    const mockJogo = { jogoId, titulo: 'Elden Ring Teste', preco: 249.90 };
    const chaveCache = `produto:item:${jogoId}`;

    const primeiraLeitura = await cacheService.get(chaveCache);
    expect(primeiraLeitura).toBeNull();

    await cacheService.set(chaveCache, mockJogo, 60);

    const segundaLeitura = await cacheService.get<typeof mockJogo>(chaveCache);
    
    expect(segundaLeitura).not.toBeNull();
    expect(segundaLeitura?.titulo).toBe('Elden Ring Teste');
    expect(segundaLeitura?.preco).toBe(249.90);
  });

  it('InvalidateAsync_DeveRemoverChaveDoRedis', async () => {
    const jogoId = 'ccc22222-2222-2222-2222-222222222222';
    const mockJogo = { jogoId, titulo: 'Jogo para Modificar' };
    const chaveCache = `produto:item:${jogoId}`;

    await cacheService.set(chaveCache, mockJogo, 60);
    await cacheService.invalidate(chaveCache);

    const leituraAposInvalidação = await cacheService.get(chaveCache);
    expect(leituraAposInvalidação).toBeNull();
  });
});