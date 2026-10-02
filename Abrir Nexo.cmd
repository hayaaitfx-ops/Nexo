@echo off
cd /d "%~dp0"
echo Abra http://127.0.0.1:47863 no navegador.
echo Mantenha esta janela aberta enquanto usa o Nexo.
node start-local.cjs
pause
