# Read deeper data from key Excel files
$ErrorActionPreference = 'SilentlyContinue'
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

# ===== RCC BUDGET - Deep Read =====
Write-Output "===== RCC BUDGET DEEP READ ====="
$wb = $excel.Workbooks.Open("D:\My Bussines\Fix And Flip\Ryan\RCC Budget Single Unit_Rev 06.11.25.xlsx", 0, $true)
foreach ($ws in $wb.Sheets) {
    Write-Output "--- Sheet: $($ws.Name) ---"
    $usedRange = $ws.UsedRange
    $rows = $usedRange.Rows.Count
    $cols = $usedRange.Columns.Count
    Write-Output "Rows=$rows Cols=$cols"
    $maxRows = [Math]::Min($rows, 50)
    for ($r = 1; $r -le $maxRows; $r++) {
        $rowData = @()
        for ($c = 1; $c -le [Math]::Min($cols, 15); $c++) {
            $val = $ws.Cells.Item($r, $c).Text
            if ($val -and $val.Trim() -ne '') { $rowData += "C$($c)=$val" }
        }
        if ($rowData.Count -gt 0) {
            Write-Output "R$($r) >> $($rowData -join ' | ')"
        }
    }
}
$wb.Close($false)

# ===== REPORTE DIARIO - TOTALES SHEET DEEP READ =====
Write-Output ""
Write-Output "===== REPORTE DIARIO TOTALES DEEP READ ====="
$wb = $excel.Workbooks.Open("D:\My Bussines\Fix And Flip\Reporte\Reporte diario.xlsx", 0, $true)
$ws = $wb.Sheets.Item("Totales")
$rows = $ws.UsedRange.Rows.Count
$cols = $ws.UsedRange.Columns.Count
Write-Output "Rows=$rows Cols=$cols"
for ($r = 1; $r -le [Math]::Min($rows, 81); $r++) {
    $rowData = @()
    for ($c = 1; $c -le [Math]::Min($cols, 24); $c++) {
        $val = $ws.Cells.Item($r, $c).Text
        if ($val -and $val.Trim() -ne '') { $rowData += "C$($c)=$val" }
    }
    if ($rowData.Count -gt 0) {
        Write-Output "R$($r) >> $($rowData -join ' | ')"
    }
}
$wb.Close($false)

# ===== CALCULO PERSONAL GASTOS DEEP READ =====
Write-Output ""
Write-Output "===== CALCULO PERSONAL GASTOS DEEP READ ====="
$wb = $excel.Workbooks.Open("D:\My Bussines\Fix And Flip\Reporte\Calculo Personal de Gastos.xlsx", 0, $true)
foreach ($ws in $wb.Sheets) {
    Write-Output "--- Sheet: $($ws.Name) ---"
    $rows = $ws.UsedRange.Rows.Count
    $cols = $ws.UsedRange.Columns.Count
    Write-Output "Rows=$rows Cols=$cols"
    for ($r = 1; $r -le [Math]::Min($rows, 40); $r++) {
        $rowData = @()
        for ($c = 1; $c -le [Math]::Min($cols, 10); $c++) {
            $val = $ws.Cells.Item($r, $c).Text
            if ($val -and $val.Trim() -ne '') { $rowData += "C$($c)=$val" }
        }
        if ($rowData.Count -gt 0) {
            Write-Output "R$($r) >> $($rowData -join ' | ')"
        }
    }
}
$wb.Close($false)

$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
