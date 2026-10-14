# Attend que Vite reponde avant d'ouvrir le navigateur.
# Evite l'ouverture arbitraire au bout de 4 secondes, parfois trop tot.
$ProgressPreference = 'SilentlyContinue'
$url = 'http://127.0.0.1:5173/'
for ($i = 0; $i -lt 100; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Start-Process $url
            exit 0
        }
    } catch { }
    Start-Sleep -Milliseconds 750
}
Write-Host 'ASTRUB : le serveur ne repond pas sur le port 5173.'
Write-Host 'Consultez la fenetre principale ASTRUB pour voir l erreur.'
Start-Sleep -Seconds 8
