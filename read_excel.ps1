# Read Excel sheets and headers from key files
$ErrorActionPreference = 'SilentlyContinue'
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

function Read-ExcelSummary($path, $label) {
    Write-Output "===== $label ====="
    Write-Output "Path: $path"
    $wb = $excel.Workbooks.Open($path, 0, $true) # ReadOnly
    Write-Output "Sheets: $($wb.Sheets.Count)"
    foreach ($ws in $wb.Sheets) {
        Write-Output "--- Sheet: $($ws.Name) ---"
        $usedRange = $ws.UsedRange
        $rows = $usedRange.Rows.Count
        $cols = $usedRange.Columns.Count
        Write-Output "Rows: $rows | Cols: $cols"
        # Read first 3 rows as headers/sample
        $maxRows = [Math]::Min($rows, 3)
        for ($r = 1; $r -le $maxRows; $r++) {
            $rowData = @()
            for ($c = 1; $c -le [Math]::Min($cols, 20); $c++) {
                $val = $ws.Cells.Item($r, $c).Text
                if ($val) { $rowData += "C$($c)=$val" }
            }
            if ($rowData.Count -gt 0) {
                Write-Output "Row$($r) >> $($rowData -join ' | ')"
            }
        }
    }
    $wb.Close($false)
    Write-Output ""
}

# 1. RCC Budget
Read-ExcelSummary "D:\My Bussines\Fix And Flip\Ryan\RCC Budget Single Unit_Rev 06.11.25.xlsx" "RCC BUDGET"

# 2. Reporte diario
Read-ExcelSummary "D:\My Bussines\Fix And Flip\Reporte\Reporte diario.xlsx" "REPORTE DIARIO"

# 3. Calculo Personal de Gastos
Read-ExcelSummary "D:\My Bussines\Fix And Flip\Reporte\Calculo Personal de Gastos.xlsx" "CALCULO PERSONAL GASTOS"

$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
