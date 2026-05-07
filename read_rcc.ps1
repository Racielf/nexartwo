# Read RCC Budget first 50 rows from "Scope of Work" sheet
$ErrorActionPreference = 'SilentlyContinue'
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$wb = $excel.Workbooks.Open("D:\My Bussines\Fix And Flip\Ryan\RCC Budget Single Unit_Rev 06.11.25.xlsx", 0, $true)
foreach ($ws in $wb.Sheets) {
    Write-Output "===== Sheet: $($ws.Name) ====="
    $rows = $ws.UsedRange.Rows.Count
    $cols = $ws.UsedRange.Columns.Count
    Write-Output "Rows=$rows Cols=$cols"
    for ($r = 1; $r -le [Math]::Min($rows, 55); $r++) {
        $rowData = @()
        for ($c = 1; $c -le [Math]::Min($cols, 15); $c++) {
            $val = $ws.Cells.Item($r, $c).Text
            if ($val -and $val.Trim() -ne '') { $rowData += "C$($c)=$val" }
        }
        if ($rowData.Count -gt 0) {
            Write-Output "R$($r) >> $($rowData -join ' | ')"
        }
    }
    Write-Output ""
}
$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
