export class statusPedido {
   constructor(public readonly status: string){
      const statusValidos = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];
      if(!statusValidos.includes(status)){
         throw new Error(
         `Status inválido. Os status válidos são: ${statusValidos.join(', ')}.`,
      );
      }
   }
}