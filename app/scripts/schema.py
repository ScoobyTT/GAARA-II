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
    abbrev_state VARCHAR(2),
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
municipios = df[['nome_mun', 'abbrev_state']].drop_duplicates()
#municipios.columns = ['codigo_ibge', 'abbrev_uf']

# 2. INSERIR NO BANCO
#muito provavelmente vou precisar mudar o nome dessas variaveis
municipios.to_sql('cod_rgi', ENGINE, if_exists='append', index=False)

print(f"Inseridos {len(municipios)} municípios.")

import pandas as pd
from sqlalchemy import create_engine
#ainda nao criei o usuario
ENGINE = create_engine('postgresql://usuario:senha@localhost:5432/sinan_arboviroses')

# 1. LER O CALENDÁRIO SINAN
# Seu arquivo sinan_calendario.txt deve ter: ANO, SEM_NOT, Início, Término
calendario = pd.read_csv("GAARA-II/app/input/sinan_calendario.txt', sep='\t")

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

import pandas as pd
from sqlalchemy import create_engine, text

# CONFIGURAÇÃO
ENGINE = create_engine('postgresql://usuario:senha@localhost:5432/sinan_arboviroses')

# 1. LER O TSV DO SINAN
df = pd.read_csv('2014-2025_DENGUE_CONFIRMADOS_dash_new.tsv', sep='\t')

# 2. CRIAR TABELA TEMPORÁRIA NO BANCO
df.to_sql('temp_sinan', ENGINE, if_exists='replace', index=False)
print(f"Tabela temporária criada com {len(df)} linhas.")

# 3. AGRUPAR E INSERIR NA FATO_CASOS
query = """
INSERT INTO fato_casos (id_tempo, id_municipio, agravo, casos_confirmados)
SELECT 
    t.id_tempo,
    g.id_municipio,
    'dengue',
    SUM(s.New_Cases)
FROM temp_sinan s
JOIN dim_tempo t 
    ON s.Noti_Week = t.semana_epidemiologica
JOIN dim_geografia g 
    ON LPAD(s.City::text, 7, '0') = g.codigo_ibge
GROUP BY t.id_tempo, g.id_municipio
ON CONFLICT (id_tempo, id_municipio, agravo) 
DO UPDATE SET casos_confirmados = EXCLUDED.casos_confirmados;
"""

with ENGINE.begin() as conn:
    conn.execute(text(query))

print("fato_casos populada com sucesso!")

# 4. LIMPAR A TEMPORÁRIA
with ENGINE.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS temp_sinan;"))

print("ETL concluído.")

SELECT 
    t.ano,
    t.semana_epidemiologica,
    g.abbrev_uf,
    SUM(f.casos_confirmados) as total_casos
FROM fato_casos f
JOIN dim_tempo t ON f.id_tempo = t.id_tempo
JOIN dim_geografia g ON f.id_municipio = g.id_municipio
WHERE f.agravo = 'dengue'
  AND t.ano = 2024
GROUP BY t.ano, t.semana_epidemiologica, g.abbrev_uf
ORDER BY t.semana_epidemiologica, g.abbrev_uf;
