export class ProcessPaymentCommand {
  constructor(
    public readonly pedidoId: string,
    public readonly valor: number,
  ) {}
}