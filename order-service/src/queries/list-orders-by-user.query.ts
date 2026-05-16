export class ListOrdersByUserQuery {
   constructor(
      public readonly userId: string,
      public readonly pagina: number,
      public readonly tamanho: number,
   ) {}
}