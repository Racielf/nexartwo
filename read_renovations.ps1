$w = New-Object -ComObject Word.Application
$w.Visible = $false
$d = $w.Documents.Open("D:\My Bussines\Fix And Flip\Renovations for.docx")
Write-Output $d.Content.Text
$d.Close($false)
$w.Quit()
