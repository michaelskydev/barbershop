$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $result = $tcp.ConnectAsync('aws-1-us-east-2.pooler.supabase.com', 6543).Wait(5000)
    Write-Host "Port 6543: OPEN"
    $tcp.Close()
} catch {
    Write-Host "Port 6543: BLOCKED/TIMEOUT"
}

$tcp2 = New-Object System.Net.Sockets.TcpClient
try {
    $result2 = $tcp2.ConnectAsync('aws-1-us-east-2.pooler.supabase.com', 5432).Wait(5000)
    Write-Host "Port 5432: OPEN"
    $tcp2.Close()
} catch {
    Write-Host "Port 5432: BLOCKED/TIMEOUT"
}
