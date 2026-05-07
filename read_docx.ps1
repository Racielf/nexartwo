$w = New-Object -ComObject Word.Application
$w.Visible = $false
$d = $w.Documents.Open("D:\My Bussines\Strategy\NexArtWO\Plan de invercionista.docx")
Write-Output $d.Content.Text
$d.Close($false)
$w.Quit()
