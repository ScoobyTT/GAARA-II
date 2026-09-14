"""
Conversão de graphs.R -> Python (pandas).

Dependências:
    pip install pandas numpy sidrapy

Notas de conversão (leia antes de rodar):
1. `estado`/`estados.rds` (geobr + sf) só era usado no R via st_drop_geometry(),
   isto é, a geometria nunca entrava nos gráficos. Por isso ele foi substituído
   aqui por uma tabela estática (27 UFs), sem depender de geobr/geopandas.
2. `ribge::populacao_municipios(ano)` não tem porte direto em Python. A função
   `populacao_municipios()` abaixo é uma reimplementação via SIDRA/IBGE
   (tabela 6579) usando o pacote `sidrapy`. Teste essa função isoladamente
   contra os números que vocês já conhecem antes de confiar no pipeline
   completo — nomes de coluna retornados pela API podem exigir ajuste.
3. No R original, `pop2023 <- ribge::populacao_municipios(2022)` (usa o dado
   de 2022 para "2023" — parece um erro de digitação). Isso ficou explícito
   e configurável em ANO_PARA_DADO_POP, ao invés de corrigido silenciosamente.
4. Os loops em R que criavam a linha "BR"/"Todos" (agregado nacional) foram
   substituídos por groupby vetorizado — mesmo resultado, muito mais rápido,
   principalmente no bloco da pirâmide etária (que no R era O(n^3) em loops).
"""

import csv
import os

import numpy as np
import pandas as pd

try:
  import sidrapy
except ImportError:  # deixa o script importável mesmo sem a lib instalada ainda
  sidrapy = None


DATA_DIR = "/data"
INPUT_DIR = os.path.join(DATA_DIR, "input")

# ---------------------------------------------------------------------------
# Tabela estática de UFs (substitui geobr::read_state() + st_drop_geometry())
# ---------------------------------------------------------------------------
ESTADOS = pd.DataFrame(
  {
    "code_state": [
      11, 12, 13, 14, 15, 16, 17,
      21, 22, 23, 24, 25, 26, 27, 28, 29,
      31, 32, 33, 35,
      41, 42, 43,
      50, 51, 52, 53,
    ],
    "abbrev_state": [
      "RO", "AC", "AM", "RR", "PA", "AP", "TO",
      "MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA",
      "MG", "ES", "RJ", "SP",
      "PR", "SC", "RS",
      "MS", "MT", "GO", "DF",
    ],
    "name_state": [
      "Rondônia", "Acre", "Amazonas", "Roraima", "Pará", "Amapá", "Tocantins",
      "Maranhão", "Piauí", "Ceará", "Rio Grande do Norte", "Paraíba",
      "Pernambuco", "Alagoas", "Sergipe", "Bahia",
      "Minas Gerais", "Espírito Santo", "Rio de Janeiro", "São Paulo",
      "Paraná", "Santa Catarina", "Rio Grande do Sul",
      "Mato Grosso do Sul", "Mato Grosso", "Goiás", "Distrito Federal",
    ],
    "name_region": [
      "Norte", "Norte", "Norte", "Norte", "Norte", "Norte", "Norte",
      "Nordeste", "Nordeste", "Nordeste", "Nordeste", "Nordeste",
      "Nordeste", "Nordeste", "Nordeste", "Nordeste",
      "Sudeste", "Sudeste", "Sudeste", "Sudeste",
      "Sul", "Sul", "Sul",
      "Centro-Oeste", "Centro-Oeste", "Centro-Oeste", "Centro-Oeste",
    ],
  }
)

UF_MAP = {
  "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP", "17": "TO",
  "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE", "29": "BA",
  "31": "MG", "32": "ES", "33": "RJ", "35": "SP",
  "41": "PR", "42": "SC", "43": "RS",
  "50": "MS", "51": "MT", "52": "GO", "53": "DF",
}

# Ver nota (3) no cabeçalho: replica o comportamento do R por padrão.
ANO_PARA_DADO_POP = {ano: ano for ano in range(2014, 2026)}
ANO_PARA_DADO_POP[2023] = 2022  # replica o "bug" do script original


def populacao_municipios(ano: int) -> pd.DataFrame:
  """
    Reimplementação de ribge::populacao_municipios(ano) via SIDRA (tabela 6579).
    Retorna colunas: cod_municipio, municipio, uf, codigo_uf, populacao.
    TESTE contra números conhecidos antes de usar em produção.
    """
if sidrapy is None:
  raise ImportError("Instale sidrapy: pip install sidrapy")

resp = sidrapy.get_table(
  table_code="4709",  # Estimativas da populacao residente por municipio
  territorial_level="6",  # 6 = municípios
  ibge_territorial_code="all",
  period=str(ano),
)
df = pd.DataFrame(resp[1:], columns=resp[0])
df = df.rename(columns={"D1C": "cod_municipio", "D1N": "municipio", "V": "populacao"})
df["populacao"] = pd.to_numeric(df["populacao"], errors="coerce")
df["cod_municipio"] = df["cod_municipio"].astype(str)
df["codigo_uf"] = df["cod_municipio"].str[:2].astype(int)
df["uf"] = df["codigo_uf"].astype(str).map(UF_MAP)
return df[["cod_municipio", "municipio", "uf", "codigo_uf", "populacao"]]

#
def aggregate_with_national_total(df, value_col, dimension_cols=("abbrev_state", "name_state")):
  """
    Equivalente ao padrão repetido no R: group_by + summarise + loop manual
    criando uma linha agregada nacional ("BR"/"Todos"). Aqui feito de forma
    vetorizada com groupby.
    """
group_cols = ["months"] + list(dimension_cols)
agg = df.groupby(group_cols, as_index=False)[value_col].sum().dropna()

national = df.groupby("months", as_index=False)[value_col].sum()
for col in dimension_cols:
  national[col] = "BR" if col == "abbrev_state" else "Todos"

return pd.concat([agg, national], ignore_index=True)


def main():
  os.chdir(DATA_DIR)

# -----------------------------------------------------------------
# Carga dos dados
# -----------------------------------------------------------------
dengue_data = pd.read_csv(
  "input/2014-2025_DENGUE_NOTIFICADOS_dash_new.tsv", sep="\t"
)
dengue_conf = pd.read_csv(
  "input/2014-2025_DENGUE_CONFIRMADOS_dash_new.tsv", sep="\t"
)

mask_no_uf = dengue_conf["uf"].isna()
dengue_conf.loc[mask_no_uf, "State"] = (
  dengue_conf.loc[mask_no_uf, "City"].astype(str).str[:2]
)

idx = dengue_conf["uf"].isna()
dengue_conf.loc[idx, "uf"] = dengue_conf.loc[idx, "State"].astype(str).map(UF_MAP)

pop = populacao_municipios(2024)

dengue_data = dengue_data.merge(
  ESTADOS, left_on="State", right_on="code_state", how="left"
)
dengue_data["months"] = (
  pd.to_datetime(dengue_data["Noti_Date"]).dt.strftime("%Y-%m") + "-01"
)

dengue_conf["State"] = pd.to_numeric(dengue_conf["State"], errors="coerce")
dengue_conf = dengue_conf.merge(
  ESTADOS, left_on="State", right_on="code_state", how="left"
)
dengue_conf["months"] = (
  pd.to_datetime(dengue_conf["Noti_Date"]).dt.strftime("%Y-%m") + "-01"
)

# -----------------------------------------------------------------
# Grafico 1
# -----------------------------------------------------------------
g1_noti = aggregate_with_national_total(dengue_data, "New_Cases").rename(
  columns={"New_Cases": "New_Cases_Noti"}
)
g1_conf = aggregate_with_national_total(dengue_conf, "New_Cases").rename(
  columns={"New_Cases": "New_Cases_Conf"}
)
dengue_data_agre_p1 = g1_noti.merge(
  g1_conf, on=["months", "abbrev_state", "name_state"], how="left"
)
dengue_data_agre_p1.to_csv("input/plot_1.tsv", sep="\t", index=False)

# -----------------------------------------------------------------
# Grafico 3 - Piramide etaria
# -----------------------------------------------------------------
bins = [0, 4, 9, 19, 29, 39, 49, 59, 69, 79, np.inf]
labels = [
  "0-4", "5-9", "10-19", "20-29", "30-39",
  "40-49", "50-59", "60-69", "70-79", "80+",
]

def pyramid_aggregate(df, value_col):
  df = df.copy()
df["New_Cases"] = np.where(df["Sex"] == "M", -df["New_Cases"], df["New_Cases"])
df["Age_Group"] = pd.cut(df["Age"], bins=bins, labels=labels, right=False)

agg = (
  df.groupby(["Sex", "Age_Group", "abbrev_state", "months"], as_index=False, observed=True)
  ["New_Cases"].sum().dropna()
)
total = (
  df.groupby(["Sex", "Age_Group", "months"], as_index=False, observed=True)
  ["New_Cases"].sum()
)
total["abbrev_state"] = "Todos"

out = pd.concat([agg, total], ignore_index=True)
return out.rename(columns={"New_Cases": value_col})

pyr_noti = pyramid_aggregate(dengue_data, "New_Cases_Noti")
pyr_conf = pyramid_aggregate(dengue_conf, "New_Cases_Conf")

dengue_data_pyramid = pyr_noti.merge(
  pyr_conf, on=["Sex", "Age_Group", "abbrev_state", "months"], how="left"
)
dengue_data_pyramid = dengue_data_pyramid[dengue_data_pyramid["Sex"] != "I"]
dengue_data_pyramid.to_csv("input/plot_3_pyramid.tsv", sep="\t", index=False)

# -----------------------------------------------------------------
# Grafico MAPA
# -----------------------------------------------------------------
dengue_conf["years"] = pd.to_datetime(dengue_conf["months"]).dt.year
conf_incidencia_mapa = (
  dengue_conf.groupby(
    ["State", "cod_municipio", "nome_munic", "populacao", "years", "abbrev_state", "months"],
    as_index=False,
  )["New_Cases"].sum().dropna()
)
conf_incidencia_mapa["incidence"] = (
  conf_incidencia_mapa["New_Cases"] / conf_incidencia_mapa["populacao"] * 100000
)
conf_incidencia_mapa.to_csv("input/plot_mapa.tsv", sep="\t", index=False)

# -----------------------------------------------------------------
# Grafico 4 - Raca/Cor
# -----------------------------------------------------------------
dengue_data["years"] = pd.to_datetime(dengue_data["weekStart"]).dt.strftime("%Y")

valid_races = ["Branca", "Preta", "Parda", "Amarela", "Indígena"]
dados_plot = dengue_data.copy()
dados_plot["Race_Colour"] = dados_plot["Race_Colour"].where(
  dados_plot["Race_Colour"].isin(valid_races)
)
dados_plot = dados_plot.dropna(subset=["Race_Colour"])

dados_plot = dados_plot.groupby(
  ["years", "Race_Colour", "Noti_Date"], as_index=False
)["New_Cases"].sum()
dados_plot["TotalAno"] = dados_plot.groupby("years")["New_Cases"].transform("sum")
dados_plot["Percentual"] = dados_plot["New_Cases"] / dados_plot["TotalAno"] * 100
dados_plot["Race_Colour"] = pd.Categorical(
  dados_plot["Race_Colour"], categories=valid_races, ordered=True
)
dados_plot = dados_plot.rename(columns={"Noti_Date": "months"})
dados_plot.to_csv("input/plot4.tsv", sep="\t", index=False)

# -----------------------------------------------------------------
# Tabela
# -----------------------------------------------------------------
dengue_data_noti = (
  dengue_data.groupby(["State", "uf", "Noti_Date"], as_index=False)["New_Cases"]
  .sum().dropna()
  .rename(columns={"New_Cases": "cases_noti", "Noti_Date": "months"})
)
dengue_data_conf = (
  dengue_conf.groupby(["State", "uf", "Noti_Date"], as_index=False)["New_Cases"]
  .sum().dropna()
  .rename(columns={"New_Cases": "cases_conf", "Noti_Date": "months"})
)
pop_estado = pop.groupby(["uf", "codigo_uf"], as_index=False)["populacao"].sum().dropna()

dengue_data_agre_table = dengue_data_noti.merge(
  dengue_data_conf, on=["State", "uf", "months"], how="left"
)
dengue_data_agre_table_final = dengue_data_agre_table.merge(
  pop_estado, left_on=["State", "uf"], right_on=["codigo_uf", "uf"], how="left"
)
dengue_data_agre_table_final["incidenceNoti"] = (
  dengue_data_agre_table_final["cases_noti"] / dengue_data_agre_table_final["populacao"] * 100000
)
dengue_data_agre_table_final["incidenceConf"] = (
  dengue_data_agre_table_final["cases_conf"] / dengue_data_agre_table_final["populacao"] * 100000
)

dengue_data_agre_table_final_f = dengue_data_agre_table_final.merge(
  ESTADOS, left_on=["State", "uf"], right_on=["code_state", "abbrev_state"], how="left"
)
# Nao ha coluna de geometria (ver nota 1 no cabecalho), entao nao ha "geom" a remover
dengue_data_agre_table_final_f.to_csv("input/plot_tabela.tsv", sep="\t", index=False)

# -----------------------------------------------------------------
# Cards
# -----------------------------------------------------------------
cards_casos_notificados  = (
  dengue_data.groupby(["abbrev_state", "Noti_Date"], as_index=False)["New_Cases"]
  .sum().rename(columns={"New_Cases": "notificados"})
)
cards_confirmados = (
  dengue_conf.groupby(["abbrev_state", "Noti_Date"], as_index=False)["New_Cases"]
  .sum().rename(columns={"New_Cases": "confirmados"})
)
cards_mortes_notificadas = (
  dengue_data[dengue_data["EVOLUCAO"] == 2]
  .groupby(["abbrev_state", "Noti_Date"], as_index=False)["New_Cases"]
  .sum().rename(columns={"New_Cases": "mortes_noti"})
)
cards_mortes_confirmadas = (
  dengue_conf[dengue_conf["EVOLUCAO"] == 2]
  .groupby(["abbrev_state", "Noti_Date"], as_index=False)["New_Cases"]
  .sum().rename(columns={"New_Cases": "mortes_conf"})
)


cards = (
  cards_casos_notificados
  .merge(cards_mortes_notificadas, on=["abbrev_state", "Noti_Date"], how="left")
  .merge(cards_confirmados, on=["abbrev_state", "Noti_Date"], how="left")
  .merge(cards_mortes_confirmadas, on=["abbrev_state", "Noti_Date"], how="left")
  .rename(columns={"Noti_Date": "months"})
)
cards[["mortes_noti", "confirmados", "mortes_conf"]] = cards[
  ["mortes_noti", "confirmados", "mortes_conf"]
].fillna(0)

cards.to_csv("input/cardss.tsv", sep="\t", index=False)
print("Graficos gerados com sucesso.")

# -----------------------------------------------------------------
# Diagrama de controle
# -----------------------------------------------------------------
plot_diagrama = (
  dengue_conf.groupby(["State", "Noti_Week", "uf"], as_index=False)["New_Cases"]
  .sum().dropna()
)
plot_diagrama["Noti_Week"] = plot_diagrama["Noti_Week"].astype(str)
plot_diagrama["year"] = plot_diagrama["Noti_Week"].str[:4]
plot_diagrama["week"] = plot_diagrama["Noti_Week"].str[4:6]

national_diag = (
  plot_diagrama.groupby("Noti_Week", as_index=False)["New_Cases"].sum()
)
national_diag["State"] = 71
national_diag["uf"] = "BR"
national_diag["year"] = national_diag["Noti_Week"].str[:4]
national_diag["week"] = national_diag["Noti_Week"].str[4:6]

plot_diagrama = pd.concat([plot_diagrama, national_diag], ignore_index=True)

pop_por_ano = {
  ano: populacao_municipios(dado_ano)
  for ano, dado_ano in ANO_PARA_DADO_POP.items()
}

pop_estados = pd.concat(
  [
    df.groupby("uf", as_index=False)["populacao"].sum().assign(ano=ano)
    for ano, df in pop_por_ano.items()
  ],
  ignore_index=True,
)
pop_brasil = pop_estados.groupby("ano", as_index=False)["populacao"].sum()
pop_brasil["uf"] = "BR"
""" 
    # -----------------------------------------------------------------
    # Sistema de predicao
    # -----------------------------------------------------------------
    conf_pred = (
        dengue_conf.groupby(["Noti_Week", "uf"], as_index=False)
        .size().rename(columns={"size": "total"}).dropna()
    )

    national_pred = conf_pred.groupby("Noti_Week", as_index=False)["total"].sum()
    national_pred["uf"] = "BR"

    conf_pred_final = pd.concat([national_pred, conf_pred], ignore_index=True)
    conf_pred_final["Noti_Week"] = conf_pred_final["Noti_Week"].astype(int)
    conf_pred_final["year"] = conf_pred_final["Noti_Week"].astype(str).str[:4]
    conf_pred_final["week"] = conf_pred_final["Noti_Week"].astype(str).str[4:7]

    conf_pred_final_prep = conf_pred_final.pivot_table(
        index="uf", columns=["year", "week"], values="total",
        fill_value=0, aggfunc="sum",
    )

    colunas = list(conf_pred_final_prep.columns)  # lista de tuplas (year, week)
    linha_anos = ["0"] + [c[0] for c in colunas]
    linha_semanas = ["Pais"] + [c[1] for c in colunas]

    body = conf_pred_final_prep.reset_index()
    body.columns = ["uf"] + [f"{y}_{w}" for y, w in colunas]

    with open(os.path.join(INPUT_DIR, "arquivo_tratamento.csv"), "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(linha_anos)
        writer.writerow(linha_semanas)
        for row in body.itertuples(index=False):
            writer.writerow(row)


if __name__ == "__main__":
    main()
"""