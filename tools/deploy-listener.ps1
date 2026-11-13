# Puts the Cluas ar Luas listener online (Firebase project chopthecheck).
# 1) Saves your Azure key as a Firebase secret (it reads it from azure-speech.txt; nothing is shown).
# 2) Deploys the cluasHear function.
# Run from the terminal with the play button. You may be asked to log in to Firebase once.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$fb = Join-Path $env:TEMP 'claude\fbtools\node_modules\.bin\firebase.cmd'
if (-not (Test-Path $fb)) { Write-Host "Firebase tools not found at $fb"; exit 1 }
$keyFile = Join-Path $env:USERPROFILE 'Documents\SpectrumTechEngine-keys\azure-speech.txt'
$line = (Get-Content $keyFile | Where-Object { $_ -like 'key=*' } | Select-Object -First 1)
if (-not $line) { Write-Host 'No key= line in azure-speech.txt'; exit 1 }
$key = $line.Substring(4).Trim()

Set-Location $root
Write-Host 'Installing the listener''s parts...'
Push-Location functions; npm install --silent; Pop-Location

Write-Host 'Saving the Azure key as a Firebase secret...'
$tmp = New-TemporaryFile
[IO.File]::WriteAllText($tmp.FullName, $key)
& $fb functions:secrets:set AZURE_SPEECH_KEY --project chopthecheck --data-file $tmp.FullName --force
Remove-Item $tmp.FullName -Force

Write-Host 'Deploying the listener...'
& $fb deploy --only functions:cluas-ar-luas --project chopthecheck
Write-Host 'Done. The app will now check speaking on the live website.'
