# Saves your Azure Speech key into Documents\SpectrumTechEngine-keys\azure-speech.txt
# The key is typed hidden (shows as ****) and is never printed.
$file = Join-Path $env:USERPROFILE 'Documents\SpectrumTechEngine-keys\azure-speech.txt'
Write-Host ''
Write-Host 'Paste your Azure KEY 1 (right-click pastes; it will show as ****), then press Enter:'
$sec = Read-Host -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)).Trim()
Write-Host 'Now type the Location/Region shown next to the key (for example westeurope), then press Enter:'
$region = (Read-Host).Trim().ToLower() -replace '\s', ''
if ($key -notmatch '^[A-Za-z0-9]{32,100}$') { Write-Host 'That does not look like an Azure key (letters and numbers only). Nothing was saved. Run me again.'; exit 1 }
if ($region -notmatch '^[a-z0-9]{4,30}$') { Write-Host 'That does not look like a region (for example westeurope). Nothing was saved. Run me again.'; exit 1 }
[IO.File]::WriteAllText($file, "key=$key`nregion=$region`n")
Write-Host "Saved to $file (key length $($key.Length), region $region)."
