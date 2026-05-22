import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class JogoCacheService implements OnModuleInit, OnModuleDestroy {
  private client!: RedisClientType;
  private readonly PREFIX = 'GestaoPedidos:'; 

  // Contadores locais em memória para estimativa de Hit Rate e tempos (Exigência do Roteiro)
  private totalHits = 0;
  private totalMisses = 0;
  private totalTimeWithCache = 0;
  private countWithCache = 0;
  private totalTimeWithoutCache = 0;
  private countWithoutCache = 0;

  async onModuleInit() {
    this.client = createClient({ url: 'redis://:redissenha123@redis:6379' });
    this.client.on('error', (err) => console.error('[Redis Error]', err));
    await this.client.connect();
    console.log('🔌 Catalog-Service conectado com sucesso ao Redis Cache!');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = `${this.PREFIX}${key}`;
    const data = await this.client.get(fullKey);

    if (!data) {
      this.totalMisses++; // Incrementa contador local de MISS
      console.log(`[Cache MISS] Chave não encontrada no Redis: ${fullKey}`);
      return null;
    }

    this.totalHits++; // Incrementa contador local de HIT
    console.log(`[Cache HIT] Chave recuperada com sucesso do Redis: ${fullKey}`);
    return JSON.parse(data) as T;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    const fullKey = `${this.PREFIX}${key}`;
    const serializedData = JSON.stringify(value);
    await this.client.set(fullKey, serializedData, {
      EX: ttlSeconds
    });
    console.log(`[Cache SET] Dado armazenado. Chave: ${fullKey} | TTL: ${ttlSeconds}s`);
  }

  async invalidate(key: string): Promise<void> {
    const fullKey = `${this.PREFIX}${key}`;
    await this.client.del(fullKey);
    console.log(`[Cache INVALIDADO] Chave removida do Redis: ${fullKey}`);
  }

  /**
   * Regista a métrica de tempo de resposta da operação
   */
  registrarMetricaTempo(comCache: boolean, tempoMs: number): void {
    if (comCache) {
      this.totalTimeWithCache += tempoMs;
      this.countWithCache++;
    } else {
      this.totalTimeWithoutCache += tempoMs;
      this.countWithoutCache++;
    }
  }

  /**
   * Compila e expõe os dados estatísticos recolhidos
   */
  async obterEstatisticas() {
    // Busca a quantidade real de chaves dinâmicas ativas no Redis através do prefixo Namespace
    const chaves = await this.client.keys(`${this.PREFIX}*`);
    
    const totalRequisicoes = this.totalHits + this.totalMisses;
    const hitRate = totalRequisicoes > 0 ? (this.totalHits / totalRequisicoes) * 100 : 0;
    
    const mediaComCache = this.countWithCache > 0 ? (this.totalTimeWithCache / this.countWithCache) : 0;
    const mediaSemCache = this.countWithoutCache > 0 ? (this.totalTimeWithoutCache / this.countWithoutCache) : 0;

    return {
      totalChavesAtivas: chaves.length,
      hitRate: `${hitRate.toFixed(2)}%`,
      detalhes: {
        cacheHits: this.totalHits,
        cacheMisses: this.totalMisses,
        totalRequisicoes
      },
      tempoMedioResposta: {
        comCache: `${mediaComCache.toFixed(4)}ms`,
        semCache: `${mediaSemCache.toFixed(4)}ms`
      }
    };
  }
}