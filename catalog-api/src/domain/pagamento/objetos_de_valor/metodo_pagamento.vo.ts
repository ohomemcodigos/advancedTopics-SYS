export class MetodoPagamento{
   constructor(
      public readonly tipo: 'Cartão de Crédito' | 'Boleto' | 'Pix' | 'Carteira Digital',
      public readonly detalhes: string //A validação não é feita aqui, esse campo serve somente para provar que uma operação ocorreu.
   ){
      if(!tipo) throw new Error('Tipo de pagamento é obrigatório.');
      if(!detalhes) throw new Error('Detalhes do pagamento são obrigatórios.');
   }
}