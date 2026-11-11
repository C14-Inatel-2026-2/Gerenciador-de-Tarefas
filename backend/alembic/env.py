import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# 1. Importação dos modelos e configurações da sua aplicação
from app.database import Base, get_database_url
from app import models  # Registra os modelos no Base.metadata

# 2. Objeto de configuração do Alembic
config = context.config

# Injeta a URL do banco de dados dinamicamente
config.set_main_option("sqlalchemy.url", get_database_url())

# Interpreta o arquivo de log se existir
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Metadados para o autogenerate reconhecer as tabelas
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Executa migrações no modo 'offline' (gera apenas o SQL sem conectar diretamente)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa migrações no modo 'online' (conecta diretamente ao banco)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()