$body = @{
    model = "groq/compound"
    messages = @(
        @{
            role = "system"
            content = "Anda adalah Kawan Kasih, AI Chatbot Asisten Informasi resmi untuk tempat wisata religi dan alam Bukit Kasih Kanonang di Minahasa, Sulawesi Utara."
        },
        @{
            role = "user"
            content = "Halo, anda siapa ?"
        }
    )
} | ConvertTo-Json -Depth 5

$apiKey = $env:GROQ_API_KEY
if (-not $apiKey) {
    $apiKey = "YOUR_GROQ_API_KEY"
}

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$response = Invoke-RestMethod -Uri "https://api.groq.com/openai/v1/chat/completions" -Method Post -Body $body -Headers $headers
Write-Host "RESPONSE USING groq/compound:"
Write-Host $response.choices[0].message.content
