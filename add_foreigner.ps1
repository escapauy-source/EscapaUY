$content = Get-Content "C:\Users\susan\Desktop\EscapaUY Claude\src\store\itineraryStore.tsx" -Raw
$pattern = '(            kids = 0;\r\n          )\r\n\r\n          console\.log'
$replacement = '$1' + "`r`n          " + "`r`n" + "          const isForeigner = state.residencyCountry -and state.residencyCountry -ne 'Uruguay';" + "`r`n" + "          " + "`r`n" + "          console.log"
$newContent = $content -replace $pattern, $replacement
$newContent | Set-Content "C:\Users\susan\Desktop\EscapaUY Claude\src\store\itineraryStore.tsx"
Write-Host "Done: Added isForeigner variable"
