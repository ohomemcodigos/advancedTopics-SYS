import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @ApiOperation({
    summary: 'Criar um novo pedido',
    description: 'Inicia o processo de compra vinculando um usuário a uma lista de jogos.'
  })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso (Pendente de Pagamento).' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou saldo insuficiente.' })
  @ApiResponse({ status: 404, description: 'Usuário ou Jogo não encontrado.' })
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
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar pagamento do pedido', description: 'Altera o status do pedido para CONFIRMADO.' })
  confirmPayment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderService.confirmOrder(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar pedidos de um usuário específico' })
  findByUser(@Param('userId') userId: string) {
    return this.orderService.findByUser(userId);
  }
}