import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt'; 

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly jwtService: JwtService
  ) { }

  // Teste
  @Get('auth/mock-token')
  @ApiOperation({ summary: 'Gera um token JWT para testes do WebSocket' })
  getMockToken() {
    const token = this.jwtService.sign({ userId: '123e4567-e89b-12d3-a456-426614174000' });
    return { token };
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um pedido' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar pagamento do pedido' })
  confirmPayment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderService.confirmOrder(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar pedidos de um usuário' })
  findByUser(@Param('userId') userId: string) {
    return this.orderService.findByUser(userId);
  }
}