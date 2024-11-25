$gitPath = "C:\Program Files\Git\cmd"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

if (-not $currentPath.Contains($gitPath)) {
    $newPath = $currentPath + ";" + $gitPath
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "Git has been added to PATH successfully!"
} else {
    Write-Host "Git is already in PATH"
}

# Refresh the current session's PATH
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine")
