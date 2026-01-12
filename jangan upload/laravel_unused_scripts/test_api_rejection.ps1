$headers = @{
    "X-User-ID" = "13"
    "Accept" = "application/json"
}

$response = Invoke-WebRequest -Uri "http://localhost:8000/api/umkm/rejection-comments" -Headers $headers -Method GET

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Content:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
