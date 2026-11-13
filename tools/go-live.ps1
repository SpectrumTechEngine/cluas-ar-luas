# Puts Cluas ar Luas live as a HIDDEN LINK (not in the main site's app list):
#   1) makes the GitHub repo public   2) turns on GitHub Pages from main   3) waits until the page answers
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
$repo = 'SpectrumTechEngine/cluas-ar-luas'
$url = 'https://thespectrumtechengine.com/cluas-ar-luas/'

Write-Host '1/3 Making the repo public...'
& $gh repo edit $repo --visibility public --accept-visibility-change-consequences --description 'Learn Irish by ear'

Write-Host '2/3 Turning on GitHub Pages...'
& $gh api -X POST "repos/$repo/pages" -f 'source[branch]=main' -f 'source[path]=/' 2>$null | Out-Null
& $gh api "repos/$repo/pages" --jq '.html_url'

Write-Host '3/3 Waiting for the site to build (usually 1-2 minutes)...'
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 10
  try { $r = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 10; if ($r.StatusCode -eq 200 -and $r.Content -match 'Cluas ar Luas') { Write-Host "LIVE: $url"; exit 0 } } catch {}
  Write-Host '  not yet...'
}
Write-Host 'Still building. Try the link again in a few minutes.'
