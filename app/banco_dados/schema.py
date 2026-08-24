CREATE TABLE dim_tempo (
    id_tempo SERIAL PRIMARY KEY,
    semana_epidemiologica INTEGER NOT NULL UNIQUE,
    ano INTEGER NOT NULL,
    mes INTEGER,
    trimestre INTEGER,
    dia_inicio DATE,
    dia_fim DATE
);

CREATE TABLE dim_geografia (
    id_municipio SERIAL PRIMARY KEY,
    codigo_ibge VARCHAR(7) NOT NULL UNIQUE,
    nome_municipio VARCHAR(100),
    abbrev_uf VARCHAR(2),
    nome_uf VARCHAR(50),
    regiao VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);

CREATE TABLE fato_casos (
    id_tempo INTEGER NOT NULL,
    id_municipio INTEGER NOT NULL,
    agravo VARCHAR(20) NOT NULL,
    casos_confirmados INTEGER DEFAULT 0,
    casos_provaveis INTEGER DEFAULT 0,
    obitos INTEGER DEFAULT 0,

    PRIMARY KEY (id_tempo, id_municipio, agravo),

    FOREIGN KEY (id_tempo) REFERENCES dim_tempo(id_tempo),
    FOREIGN KEY (id_municipio) REFERENCES dim_geografia(id_municipio)
);

CREATE INDEX idx_fato_agravo ON fato_casos(agravo);
CREATE INDEX idx_fato_tempo ON fato_casos(id_tempo);
CREATE INDEX idx_fato_municipio ON fato_casos(id_municipio);
CREATE INDEX idx_fato_composto ON fato_casos(agravo, id_municipio, id_tempo);

import pandas as pd
from sqlalchemy import create_engine

# CONFIGURAÇÃO
#ainda nao criei o usuario; nao estou conseguindo usar o anydesk
#ENGINE = create_engine('postgresql://usuario:senha@localhost:5432/sinan_arboviroses')


# Se você não tiver o CSV completo, pode criar a partir dos dados do seu TSV:
df = pd.read_csv('2014-2025_DENGUE_CONFIRMADOS_dash_new.tsv', sep='\t')

# Extrai municípios únicos do seu próprio dado
#acho q ainda ainda nao tenho a variavel de municipio dentro do 'dt' original, preciso verificar. mas tenho um doc com essas informacoes dentro da pasta "input"
#municipios = df[['City', 'State']].drop_duplicates()
#municipios.columns = ['codigo_ibge', 'abbrev_uf']

# 2. INSERIR NO BANCO
#muito provavelmente vou precisar mudar o nome dessas variaveis
#municipios.to_sql('dim_geografia', ENGINE, if_exists='append', index=False)

print(f"Inseridos {len(municipios)} municípios.")

import pandas as pd
from sqlalchemy import create_engine

ENGINE = create_engine('postgresql://usuario:senha@localhost:5432/sinan_arboviroses')

# 1. LER O CALENDÁRIO SINAN
# Seu arquivo sinan_calendario.txt deve ter: ANO, SEM_NOT, Início, Término
calendario = pd.read_csv('sinan_calendario.txt', sep='\t')

# 2. TRANSFORMAR PARA O FORMATO DA TABELA
dim_tempo = pd.DataFrame()
dim_tempo['semana_epidemiologica'] = calendario['ANO'] * 100 + calendario['SEM_NOT']
dim_tempo['ano'] = calendario['ANO']
dim_tempo['mes'] = pd.to_datetime(calendario['Início']).dt.month
dim_tempo['trimestre'] = pd.to_datetime(calendario['Início']).dt.quarter
dim_tempo['dia_inicio'] = pd.to_datetime(calendario['Início'])
dim_tempo['dia_fim'] = pd.to_datetime(calendario['Término'])

# Remove duplicatas (se houver)
dim_tempo = dim_tempo.drop_duplicates(subset=['semana_epidemiologica'])

# 3. INSERIR NO BANCO
dim_tempo.to_sql('dim_tempo', ENGINE, if_exists='append', index=False)

print(f"Inseridas {len(dim_tempo)} semanas epidemiológicas.")

import pandas as pd
from sqlalchemy import create_engine

ENGINE = create_engine('postgresql://usuario:senha@localhost:5432/sinan_arboviroses')

# Gera semanas de 2014 a 2025
semanas = []
for ano in range(2014, 2026):
    for semana in range(1, 54):
        semanas.append({
            'semana_epidemiologica': int(f"{ano}{semana:02d}"),
            'ano': ano,
            'mes': None,
            'trimestre': None,
            'dia_inicio': None,
            'dia_fim': None
        })

df = pd.DataFrame(semanas)
df.to_sql('dim_tempo', ENGINE, if_exists='append', index=False)
print(f"Inseridas {len(df)} semanas.")
