-- Verificar e criar a tabela PedidosReadModel
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidosReadModel')
BEGIN
    CREATE TABLE PedidosReadModel (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        cliente_id UNIQUEIDENTIFIER NOT NULL,
        cliente_nome VARCHAR(255),
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50),
        criado_em DATETIME DEFAULT GETDATE()
    );
END
GO

-- Verificar e criar a tabela ItensReadModel
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItensReadModel')
BEGIN
    CREATE TABLE ItensReadModel (
        id INT IDENTITY(1,1) PRIMARY KEY,
        pedido_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES PedidosReadModel(id),
        jogo_id UNIQUEIDENTIFIER NOT NULL,
        jogo_nome VARCHAR(255),
        preco_unitario DECIMAL(10,2),
        quantidade INT
    );
END
GO

-- Verificar e criar a tabela ProcessedEvents
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProcessedEvents')
BEGIN
    CREATE TABLE ProcessedEvents (
        event_id UNIQUEIDENTIFIER PRIMARY KEY,
        processado_em DATETIME DEFAULT GETDATE()
    );
END
GO