export class Dinheiro{
   constructor(
      public readonly valor: number,
      public readonly moeda: string = 'BRL'
   ){
      if(valor < 0) throw new Error('O valor não pode ser negativo.');
   }
}