it('/jogos (POST) - Deve criar um jogo com sucesso', async () => {
  return request(app.getHttpServer())
    .post('/jogos')
    .send({
      titulo: 'God of War',
      descricao: 'Aventura épica de Kratos',
      desenvolvedora: 'Santa Monica',
      preco: { valor: 200, moeda: 'BRL' },
      categoria: { nome: 'Ação' },
      classificacaoIndicativa: { faixa: '18+' },
      requisitosTecnicos: {
        sistemaOperacional: 'PS5',
        placaDeVideo: 'N/A',
        memoriaRam: '16GB',
      },
    })
    .expect(201)
    .then((response) => {
      expect(response.body?.jogoId).toBeDefined();
      expect(response.body?.titulo).toBe('God of War');
    });
});