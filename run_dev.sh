#!/usr/bin/env bash
# ==============================================================================
# Script de Inicialização Rápida para Desenvolvimento - GAARA-II
# Inicia o Backend FastAPI na porta 8000 e o Frontend Angular na porta 4200
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "========================================================"
echo "    Iniciando Ecossistema GAARA-II (Dev Mode)"
echo "========================================================"

# Inicia backend
echo "-> Iniciando Backend FastAPI..."
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
    echo "Criando virtualenv..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

PYTHONPATH=. ./venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend rodando em: http://localhost:8000 (PID: $BACKEND_PID)"
echo "Documentação Swagger: http://localhost:8000/api/v1/docs"

# Inicia frontend
echo "-> Iniciando Frontend Angular..."
cd "$FRONTEND_DIR"
npm start &
FRONTEND_PID=$!
echo "Frontend rodando em: http://localhost:4200 (PID: $FRONTEND_PID)"

# Função para encerrar subprocessos ao sair
cleanup() {
    echo ""
    echo "Encerrando servidores GAARA-II..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "Servidores ativos. Pressione Ctrl+C para encerrar."
wait
