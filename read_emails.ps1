# Read email subjects from Tony/Gmail folder
$ErrorActionPreference = 'SilentlyContinue'
$gmailPath = "D:\My Bussines\Fix And Flip\Tony\Gmail"
$emails = Get-ChildItem $gmailPath -Filter "*.eml" | Sort-Object Name
Write-Output "===== EMAIL INVENTORY ($($emails.Count) emails) ====="
foreach ($e in $emails) {
    $content = Get-Content $e.FullName -TotalCount 30 -Encoding UTF8
    $subject = ($content | Where-Object { $_ -match "^Subject:" }) -replace "^Subject:\s*", ""
    $from = ($content | Where-Object { $_ -match "^From:" }) -replace "^From:\s*", ""
    $date = ($content | Where-Object { $_ -match "^Date:" }) -replace "^Date:\s*", ""
    $to = ($content | Where-Object { $_ -match "^To:" }) -replace "^To:\s*", ""
    Write-Output "FILE: $($e.Name)"
    Write-Output "  Subject: $subject"
    Write-Output "  From: $from"
    Write-Output "  Date: $date"
    Write-Output "  To: $to"
    Write-Output ""
}
