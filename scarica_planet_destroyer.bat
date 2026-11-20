@echo off
setlocal
rem Scarica l'ultima versione di Planet Destroyer da GitHub in una cartella accanto a questo file.
rem Usa curl e tar inclusi in Windows 10 e 11: non serve installare git.

set "ZIP_URL=https://github.com/francescobiguzzi09-del/Planet_Destroyer/archive/refs/heads/main.zip"
set "DEST=%~dp0Planet_Destroyer"
set "WORK=%~dp0_planet_destroyer_download"

echo Scarico Planet Destroyer da GitHub...
if exist "%WORK%" rmdir /s /q "%WORK%"
mkdir "%WORK%" || goto :error

"%SystemRoot%\System32\curl.exe" -L --fail --silent --show-error -o "%WORK%\repo.zip" "%ZIP_URL%" || goto :error
"%SystemRoot%\System32\tar.exe" -xf "%WORK%\repo.zip" -C "%WORK%" || goto :error

if exist "%DEST%" rmdir /s /q "%DEST%"
move "%WORK%\Planet_Destroyer-main" "%DEST%" >nul || goto :error
rmdir /s /q "%WORK%"

echo.
echo Fatto! Il gioco si trova in: %DEST%
start "" "%DEST%\index.html"
pause
exit /b 0

:error
echo.
echo ERRORE: download o estrazione non riusciti. Controlla la connessione a internet e riprova.
if exist "%WORK%" rmdir /s /q "%WORK%"
pause
exit /b 1
