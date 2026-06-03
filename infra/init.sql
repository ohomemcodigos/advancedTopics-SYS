-- init.sql — executado manualmente ou via entrypoint customizado
-- SQL Server não executa scripts de /docker-entrypoint-initdb.d automaticamente.
-- Execute este arquivo após o container subir:
--   docker exec -it gestaopedidos-sqlserver \
--     /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'MasterKey@123!' -C -i /init.sql

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'user_db')
BEGIN
  CREATE DATABASE user_db;
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'catalog_db')
BEGIN
  CREATE DATABASE catalog_db;
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'order_db')
BEGIN
  CREATE DATABASE order_db;
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'payment_db')
BEGIN
  CREATE DATABASE payment_db;
END
GO

-- Read model e tabelas de idempotência para o order-service
USE order_db;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidosReadModel')
BEGIN
  CREATE TABLE PedidosReadModel (
    id            UNIQUEIDENTIFIER PRIMARY KEY,
    cliente_id    UNIQUEIDENTIFIER NOT NULL,
    cliente_nome  VARCHAR(255),
    total         DECIMAL(10,2) NOT NULL DEFAULT 0,
    status        VARCHAR(50),
    criado_em     DATETIME DEFAULT GETDATE()
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItensReadModel')
BEGIN
  CREATE TABLE ItensReadModel (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    pedido_id       UNIQUEIDENTIFIER NOT NULL REFERENCES PedidosReadModel(id),
    jogo_id         UNIQUEIDENTIFIER NOT NULL,
    jogo_nome       VARCHAR(255),
    preco_unitario  DECIMAL(10,2),
    quantidade      INT
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProcessedEvents')
BEGIN
  CREATE TABLE ProcessedEvents (
    event_id      UNIQUEIDENTIFIER PRIMARY KEY,
    processado_em DATETIME DEFAULT GETDATE()
  );
END
GO
