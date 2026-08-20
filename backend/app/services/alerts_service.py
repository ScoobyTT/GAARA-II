"""Serviço de Sistema de Alerta Precoce (Alinhado ao Subprojeto 1 do Projeto de Pesquisa)."""

from app.repositories.mock_repository import mock_repo
from app.schemas.alerts import AlertSummaryResponse, AlertNotification

class AlertsService:
    def get_alerts_summary(self, uf: str = "Todos") -> AlertSummaryResponse:
        raw_list = mock_repo.get_alerts()
        if uf not in ["Todos", "BR", ""]:
            raw_list = [a for a in raw_list if a["uf"] == uf]

        notifications = [AlertNotification(**item) for item in raw_list]
        criticos = sum(1 for a in notifications if a.nivel_risco == "CRITICO")
        altos = sum(1 for a in notifications if a.nivel_risco == "ALTO")
        moderados = sum(1 for a in notifications if a.nivel_risco == "MODERADO")

        return AlertSummaryResponse(
            total_alertas_ativos=len(notifications),
            alertas_criticos=criticos,
            alertas_altos=altos,
            alertas_moderados=moderados,
            alertas=notifications
        )

alerts_service = AlertsService()
