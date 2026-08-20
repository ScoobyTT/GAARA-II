"""Serviço de Simulação de Cenários Climáticos/Epidemiológicos (Subprojeto 1)."""

from app.schemas.simulation import SimulationRequest, SimulationResponse, SimulationPoint

class SimulationService:
    def simulate_scenario(self, req: SimulationRequest) -> SimulationResponse:
        # Fator biológico de proliferação do Aedes aegypti:
        # Aumento de temperatura acelera o ciclo extrínseco do vírus.
        # Precipitação e umidade aumentam criadouros.
        fator_temp = req.delta_temperatura * 0.08  # +8% de casos por +1ºC
        fator_prec = (req.delta_precipitacao / 100.0) * 0.45 # +4.5% a cada +10% de chuva
        fator_umid = (req.delta_umidade / 100.0) * 0.30

        impacto_total = fator_temp + fator_prec + fator_umid
        impacto_pct = round(impacto_total * 100.0, 1)

        base_semanal = 8500 if req.uf in ["Todos", "BR", ""] else 900
        curva = []

        for sem in range(1, req.semanas_projecao + 1):
            baseline = int(base_semanal * (1.0 + 0.04 * sem))
            simulado = int(baseline * (1.0 + impacto_total))
            
            if impacto_pct > 30:
                risco = "CRÍTICO"
            elif impacto_pct > 15:
                risco = "ALTO"
            elif impacto_pct > 0:
                risco = "MODERADO"
            else:
                risco = "BAIXO"

            curva.append(SimulationPoint(
                semana_projecao=sem,
                casos_baseline=baseline,
                casos_simulados=simulado,
                impacto_percentual=impacto_pct,
                risco_estimado=risco
            ))

        return SimulationResponse(
            uf=req.uf,
            delta_temperatura=req.delta_temperatura,
            delta_precipitacao=req.delta_precipitacao,
            delta_umidade=req.delta_umidade,
            aumento_medio_casos_pct=impacto_pct,
            curva_projecao=curva,
            nota_metodologica="Simulação preliminar orientada por elasticidade bio-climática (Placeholder para modelos LSTM/GLMM)."
        )

simulation_service = SimulationService()
