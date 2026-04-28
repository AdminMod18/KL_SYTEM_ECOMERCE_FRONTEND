<#
.SYNOPSIS
  Inicializa Git en trunk (main), commits incrementales en el frontend y opcionalmente push.

.USAGE
    cd "C:\Users\Hugo\Documents\KL_SYTEM_ECOMERCE_FRONTEND"
    .\tools\trunk-initial-push.ps1
    .\tools\trunk-initial-push.ps1 -DoPush

  No incluye node_modules (respeta .gitignore existente).

  Remoto: https://github.com/AdminMod18/KL_SYTEM_ECOMERCE_FRONTEND.git
#>
param(
    [string]$RemoteUrl = "https://github.com/AdminMod18/KL_SYTEM_ECOMERCE_FRONTEND.git",
    [switch]$DoPush
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$null = Get-Command git -ErrorAction Stop

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

if (-not (git config --get user.email 2>$null)) {
    $email = if ($env:GIT_USER_EMAIL) { $env:GIT_USER_EMAIL } else { "AdminMod18@users.noreply.github.com" }
    $name = if ($env:GIT_USER_NAME) { $env:GIT_USER_NAME } else { "AdminMod18" }
    git config user.email $email
    git config user.name $name
}

$remotes = @(git remote 2>$null)
if ($remotes -notcontains "origin") {
    git remote add origin $RemoteUrl
} else {
    git remote set-url origin $RemoteUrl
}

function Commit-Staged {
    param([string]$Message)
    $staged = @(git diff --cached --name-only)
    if ($staged.Count -gt 0) {
        git commit -m $Message
    }
}

$steps = @(
    @{ Paths = @(".gitignore", "package.json", "package-lock.json", "vite.config.js", "tailwind.config.js", "postcss.config.js", "index.html", ".env.example", "tools\trunk-initial-push.ps1"); Message = "chore: proyecto Vite + React + Tailwind y script de push trunk" },
    @{ Paths = @("src/main.jsx", "src/index.css", "src/App.jsx"); Message = "feat(ui): punto de entrada, estilos globales y enrutado principal" },
    @{ Paths = @("src/components/Layout.jsx", "src/api/client.js", "src/context/CartContext.jsx"); Message = "feat(ui): layout, cliente HTTP y contexto de carrito" },
    @{ Paths = @("src/pages/Catalogo.jsx"); Message = "feat(pages): catálogo de productos" },
    @{ Paths = @("src/pages/Carrito.jsx", "src/pages/Checkout.jsx"); Message = "feat(pages): carrito y checkout" },
    @{ Paths = @("src/pages/Login.jsx", "src/pages/Registro.jsx"); Message = "feat(pages): login y registro" }
)

foreach ($step in $steps) {
    foreach ($p in $step.Paths) {
        if (Test-Path $p) {
            git add $p
        }
    }
    Commit-Staged $step.Message
}

Write-Host "Historial reciente:" -ForegroundColor Green
if (git rev-parse --verify HEAD 2>$null) {
    git log --oneline -15
}

if ($DoPush) {
    git push -u origin main
    Write-Host "Push completado a origin/main." -ForegroundColor Green
} else {
    Write-Host "Siguiente paso: git push -u origin main   (o ejecuta con -DoPush)" -ForegroundColor Cyan
}
