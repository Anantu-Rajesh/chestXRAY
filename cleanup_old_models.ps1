# Cleanup script for old model files
# Keeps only the final DenseNet models (densenet_v1.keras and densenet_v1_p1.keras)
# Deletes all old EfficientNet experiments and corrupted .h5 files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Model Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$modelDir = "model"

# Files to keep
$keepFiles = @(
    "densenet_v1.keras",
    "densenet_v1_p1.keras"
)

Write-Host "Files to KEEP:" -ForegroundColor Green
foreach ($file in $keepFiles) {
    if (Test-Path "$modelDir\$file") {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (not found)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Get all model files
$allModels = Get-ChildItem -Path $modelDir -Filter "*.h5", "*.keras" -Recurse

# Files to delete
$deleteFiles = $allModels | Where-Object { 
    $_.Name -notin $keepFiles 
}

if ($deleteFiles.Count -eq 0) {
    Write-Host "No files to delete. All clean!" -ForegroundColor Green
    exit 0
}

Write-Host "Files to DELETE ($($deleteFiles.Count) files):" -ForegroundColor Yellow
foreach ($file in $deleteFiles) {
    $sizeMB = [math]::Round($file.Length / 1MB, 2)
    Write-Host "  - $($file.Name) ($sizeMB MB)" -ForegroundColor Yellow
}
Write-Host ""

$totalSizeMB = [math]::Round(($deleteFiles | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
Write-Host "Total space to free: $totalSizeMB MB" -ForegroundColor Cyan
Write-Host ""

# Confirm deletion
$confirmation = Read-Host "Delete these files? (yes/no)"

if ($confirmation -eq "yes") {
    Write-Host ""
    Write-Host "Deleting files..." -ForegroundColor Red
    
    foreach ($file in $deleteFiles) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "  ✓ Deleted: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to delete: $($file.Name)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Cleanup complete! Freed $totalSizeMB MB" -ForegroundColor Green
} else {
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
