export class ClassificacaoIndicativa {
  constructor(public readonly faixaEtaria: string) {
    const faixasValidas = ['Livre', '10+', '12+', '14+', '16+', '18+'];
    if (!faixasValidas.includes(faixaEtaria)) {
      throw new Error(
        `Faixa etária inválida. As faixas válidas são: ${faixasValidas.join(', ')}.`,
      );
    }
  }
}
