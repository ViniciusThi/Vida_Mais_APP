#!/bin/bash

echo "🧹 LIMPANDO INSTÂNCIA AWS - Deixando tudo cru"
echo "=============================================="
echo ""

# Parar todos os serviços
echo "Parando serviços..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -f node 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true

# Remover diretório do projeto
echo "Removendo projeto..."
cd ~
rm -rf Vida_Mais_APP

# Desinstalar PM2
echo "Desinstalando PM2..."
npm uninstall -g pm2 2>/dev/null || true
sudo npm uninstall -g pm2 2>/dev/null || true

# Parar e remover bancos de dados
echo "Removendo bancos de dados..."
sudo systemctl stop mysql postgresql 2>/dev/null || true
sudo apt-get remove --purge mysql-server mysql-client postgresql postgresql-contrib -y 2>/dev/null || true
sudo apt-get autoremove -y
sudo apt-get autoclean -y

# Remover diretórios de dados
echo "Removendo dados dos bancos..."
sudo rm -rf /var/lib/mysql
sudo rm -rf /var/lib/postgresql
sudo rm -rf /etc/mysql
sudo rm -rf /etc/postgresql

# Limpar cache npm
echo "Limpando cache npm..."
npm cache clean --force 2>/dev/null || true

echo ""
echo "✅ INSTÂNCIA LIMPA! Agora execute os comandos manuais."
echo ""

