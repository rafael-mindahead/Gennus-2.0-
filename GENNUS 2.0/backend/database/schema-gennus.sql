-- Schema inicial proposto para o ERP GENNUS 2.0
-- Banco alvo: MySQL 8+
-- Observação: este arquivo é uma base arquitetural para iniciar migrations.

CREATE DATABASE IF NOT EXISTS gennus
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gennus;

CREATE TABLE empresas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nome_fantasia VARCHAR(150) NOT NULL,
  razao_social VARCHAR(180) NULL,
  documento VARCHAR(20) NULL,
  email VARCHAR(180) NULL,
  telefone VARCHAR(30) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_empresas_documento (documento)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('ADMIN','GESTOR','OPERADOR') NOT NULL DEFAULT 'OPERADOR',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  UNIQUE KEY uk_usuarios_empresa_email (empresa_id, email),
  KEY idx_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE clientes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  nome_mae VARCHAR(150) NULL,
  email VARCHAR(180) NULL,
  telefone VARCHAR(30) NULL,
  documento VARCHAR(20) NULL,
  tipo_pessoa ENUM('FISICA','JURIDICA') NOT NULL DEFAULT 'FISICA',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clientes_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  KEY idx_clientes_empresa_nome (empresa_id, nome),
  KEY idx_clientes_empresa_documento (empresa_id, documento)
) ENGINE=InnoDB;

CREATE TABLE categorias_produto (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categorias_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  UNIQUE KEY uk_categorias_empresa_nome (empresa_id, nome)
) ENGINE=InnoDB;

CREATE TABLE produtos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  categoria_id BIGINT NULL,
  nome VARCHAR(180) NOT NULL,
  descricao TEXT NULL,
  ean VARCHAR(30) NULL,
  unidade VARCHAR(20) NOT NULL DEFAULT 'un',
  custo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  preco_venda DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estoque_atual DECIMAL(12,3) NOT NULL DEFAULT 0.000,
  estoque_minimo DECIMAL(12,3) NOT NULL DEFAULT 0.000,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produtos_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_produtos_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias_produto(id)
    ON DELETE SET NULL,
  UNIQUE KEY uk_produtos_empresa_ean (empresa_id, ean),
  KEY idx_produtos_empresa_nome (empresa_id, nome),
  KEY idx_produtos_empresa_categoria (empresa_id, categoria_id)
) ENGINE=InnoDB;

CREATE TABLE vendas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  cliente_id BIGINT NULL,
  usuario_id BIGINT NOT NULL,
  codigo VARCHAR(30) NOT NULL,
  canal ENUM('ONLINE','WHATSAPP','PRESENCIAL','MARKETPLACE') NOT NULL DEFAULT 'PRESENCIAL',
  status ENUM('PENDENTE','PAGO','EM_SEPARACAO','ENVIADO','CONCLUIDO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50) NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  desconto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  custo_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  data_venda DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vendas_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_vendas_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_vendas_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE RESTRICT,
  UNIQUE KEY uk_vendas_empresa_codigo (empresa_id, codigo),
  KEY idx_vendas_empresa_data (empresa_id, data_venda),
  KEY idx_vendas_empresa_status (empresa_id, status)
) ENGINE=InnoDB;

CREATE TABLE venda_itens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  venda_id BIGINT NOT NULL,
  produto_id BIGINT NOT NULL,
  quantidade DECIMAL(12,3) NOT NULL,
  preco_unitario DECIMAL(12,2) NOT NULL,
  custo_unitario DECIMAL(12,2) NOT NULL,
  total_item DECIMAL(12,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venda_itens_venda
    FOREIGN KEY (venda_id) REFERENCES vendas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_venda_itens_produto
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
    ON DELETE RESTRICT,
  KEY idx_venda_itens_venda (venda_id),
  KEY idx_venda_itens_produto (produto_id)
) ENGINE=InnoDB;

CREATE TABLE estoque_movimentos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  produto_id BIGINT NOT NULL,
  usuario_id BIGINT NULL,
  tipo ENUM('ENTRADA','SAIDA','AJUSTE') NOT NULL,
  origem_tipo VARCHAR(40) NULL,
  origem_id BIGINT NULL,
  quantidade DECIMAL(12,3) NOT NULL,
  custo_unitario DECIMAL(12,2) NULL,
  observacao VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_estoque_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_estoque_produto
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_estoque_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL,
  KEY idx_estoque_empresa_produto_data (empresa_id, produto_id, created_at),
  KEY idx_estoque_origem (origem_tipo, origem_id)
) ENGINE=InnoDB;

CREATE TABLE venda_status_historico (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  venda_id BIGINT NOT NULL,
  usuario_id BIGINT NULL,
  status_anterior VARCHAR(40) NULL,
  status_novo VARCHAR(40) NOT NULL,
  observacao VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venda_status_venda
    FOREIGN KEY (venda_id) REFERENCES vendas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_venda_status_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL,
  KEY idx_venda_status_venda_data (venda_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE funcionarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  nome_mae VARCHAR(150) NULL,
  tipo_contrato ENUM('CLT','PJ') NOT NULL,
  documento VARCHAR(20) NULL,
  salario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
  vt DECIMAL(12,2) NULL,
  vr DECIMAL(12,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_funcionarios_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  KEY idx_funcionarios_empresa_nome (empresa_id, nome),
  KEY idx_funcionarios_empresa_status (empresa_id, status)
) ENGINE=InnoDB;

CREATE TABLE funcionario_beneficios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  funcionario_id BIGINT NOT NULL,
  descricao VARCHAR(150) NOT NULL,
  valor DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_beneficios_funcionario
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE despesas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  funcionario_id BIGINT NULL,
  venda_id BIGINT NULL,
  categoria VARCHAR(100) NOT NULL,
  tipo ENUM('MANUAL','FOLHA','CMV') NOT NULL DEFAULT 'MANUAL',
  descricao VARCHAR(180) NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_competencia DATE NOT NULL,
  created_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_despesas_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_despesas_funcionario
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_despesas_venda
    FOREIGN KEY (venda_id) REFERENCES vendas(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_despesas_usuario
    FOREIGN KEY (created_by) REFERENCES usuarios(id)
    ON DELETE SET NULL,
  KEY idx_despesas_empresa_data_tipo (empresa_id, data_competencia, tipo)
) ENGINE=InnoDB;

CREATE TABLE auditoria_eventos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_id BIGINT NOT NULL,
  usuario_id BIGINT NULL,
  entidade VARCHAR(80) NOT NULL,
  entidade_id BIGINT NULL,
  acao VARCHAR(40) NOT NULL,
  dados_antes JSON NULL,
  dados_depois JSON NULL,
  ip VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auditoria_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_auditoria_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL,
  KEY idx_auditoria_entidade (empresa_id, entidade, entidade_id),
  KEY idx_auditoria_data (empresa_id, created_at)
) ENGINE=InnoDB;

-- Seed mínimo compatível com a rota /auth/register-demo atual.
-- A senha deve ser criada pela aplicação com bcrypt; não inserir senha real em texto puro.
INSERT INTO empresas (id, nome_fantasia, razao_social, documento, email)
VALUES (1, 'Empresa Demo', 'Empresa Demo LTDA', NULL, 'admin@gennus.com')
ON DUPLICATE KEY UPDATE nome_fantasia = VALUES(nome_fantasia);
