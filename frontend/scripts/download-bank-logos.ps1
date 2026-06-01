<#
  Copia os logos SVG escolhidos para frontend/public/banks/<slug>.svg E gera o
  seed backend/app/db/seeds/004_bancos_logotipo.sql a partir do MESMO mapa, para
  que os arquivos e a coluna `bancos.logotipo` nunca fiquem fora de sincronia.

  Fonte: repositorio publico https://github.com/Tgentil/Bancos-em-SVG, clonado
  na raiz do projeto como ./Bancos-em-SVG. Se nao existir, rode antes (na raiz):
      git clone https://github.com/Tgentil/Bancos-em-SVG

  Cada entrada do mapa: COD COMPE => @{ slug; path } onde `path` e um curinga
  (para nao depender de acentos nos nomes das pastas do clone). So foram
  escolhidas variantes coloridas/com viewBox (evitando logos brancas que
  sumiriam no tile claro).

  Uso (a partir de frontend/):
      powershell -ExecutionPolicy Bypass -File .\scripts\download-bank-logos.ps1
#>
$ErrorActionPreference = 'Stop'

$clone   = Join-Path $PSScriptRoot '..\..\Bancos-em-SVG'
$dest    = Join-Path $PSScriptRoot '..\public\banks'
$seedSql = Join-Path $PSScriptRoot '..\..\backend\app\db\seeds\004_bancos_logotipo.sql'

if (-not (Test-Path $clone)) {
  Write-Error "Clone nao encontrado em '$clone'. Rode na raiz do projeto: git clone https://github.com/Tgentil/Bancos-em-SVG"
}
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# COD COMPE => @{ slug = <arquivo de destino>; path = <curinga no clone> }
$map = [ordered]@{
  '001' = @{ slug = 'banco-do-brasil'; path = 'Banco do Brasil*\banco-do-brasil-sem-fundo.svg' }
  '003' = @{ slug = 'amazonia';        path = 'Banco da Amaz*\banco-da-amazonia.svg' }
  '004' = @{ slug = 'bnb';             path = 'Banco do Nordeste*\Logo_BNB.svg' }
  '021' = @{ slug = 'banestes';        path = 'Banco do Estado do Espirito*\banestes.svg' }
  '033' = @{ slug = 'santander';       path = 'Banco Santander*\santander-fundo-vermelho.svg' }
  '037' = @{ slug = 'banpara';         path = 'Banco do Estado do Para\banpara-logo-sem-fundo.svg' }
  '041' = @{ slug = 'banrisul';        path = 'Banrisul\banrisul-logo-2023.svg' }
  '047' = @{ slug = 'banese';          path = 'Banco do Estado do Sergipe\logo banese.svg' }
  '070' = @{ slug = 'brb';             path = 'BRB*\brb-logo.svg' }
  '077' = @{ slug = 'inter';           path = 'Banco Inter S.A\inter.svg' }
  '082' = @{ slug = 'topazio';         path = 'Banco Topazio\logo-banco-topazio.svg' }
  '085' = @{ slug = 'ailos';           path = 'Ailos\logo-ailos.svg' }
  '102' = @{ slug = 'xp';              path = 'XP Investimentos\xp-investimentos-logo.svg' }
  '104' = @{ slug = 'caixa';           path = 'Caixa*\caixa-economica-federal-X.svg' }
  '133' = @{ slug = 'cresol';          path = 'Cresol\Icone-original.svg' }
  '136' = @{ slug = 'unicred';         path = 'Unicred\unicred-centralizada.svg' }
  '197' = @{ slug = 'stone';           path = 'Stone*\stone.svg' }
  '208' = @{ slug = 'btg-pactual';     path = 'Banco BTG*\btg-pactual.svg' }
  '212' = @{ slug = 'original';        path = 'Banco Original*\banco-original-logo-verde.svg' }
  '218' = @{ slug = 'bs2';             path = 'Banco BS2*\Banco_BS2.svg' }
  '237' = @{ slug = 'bradesco';        path = 'Bradesco*\bradesco.svg' }
  '246' = @{ slug = 'abc-brasil';      path = 'ABC Brasil\logoabc.svg' }
  '260' = @{ slug = 'nubank';          path = 'Nu Pagamentos*\nubank-logo-fundo-roxo2021.svg' }
  '290' = @{ slug = 'pagbank';         path = 'PagSeguro*\logo-pagbank.svg' }
  '318' = @{ slug = 'bmg';             path = 'Banco BMG\banco-bmg-logo.svg' }
  '323' = @{ slug = 'mercado-pago';    path = 'Mercado Pago\mercado-pago.svg' }
  '336' = @{ slug = 'c6';              path = 'Banco C6 S.A\c6 bank.svg' }
  '341' = @{ slug = 'itau';            path = 'Ita*\itau.svg' }
  '364' = @{ slug = 'efi';             path = 'Ef*Gerencianet\logo-efi-bank-laranja.svg' }
  '380' = @{ slug = 'picpay';          path = 'PicPay\Logo-PicPay.svg' }
  '389' = @{ slug = 'mercantil';       path = 'Banco Mercantil*\banco-mercantil-novo-azul.svg' }
  '403' = @{ slug = 'cora';            path = 'Cora*\icone-cora-rosa-pequeno.svg' }
  '413' = @{ slug = 'bv';              path = 'Banco Votorantim\banco-bv-logo.svg' }
  '422' = @{ slug = 'safra';           path = 'Banco Safra*\logo-safra.svg' }
  '456' = @{ slug = 'mufg';            path = 'MUFG\mufg-seeklogo.svg' }
  '611' = @{ slug = 'paulista';        path = 'Banco Paulista\banco-paulista.svg' }
  '613' = @{ slug = 'omni';            path = 'Omni\logo-omni.svg' }
  '637' = @{ slug = 'sofisa';          path = 'Banco Sofisa\logo-sofisa.svg' }
  '643' = @{ slug = 'pine';            path = 'Banco Pine\banco-pine.svg' }
  '707' = @{ slug = 'daycoval';        path = 'Banco Daycoval\logo-Daycoval.svg' }
  '748' = @{ slug = 'sicredi';         path = 'Sicredi\logo-svg2.svg' }
  '756' = @{ slug = 'sicoob';          path = 'Sicoob\sicoob-vector-logo.svg' }
}

$ok = 0
$updates = New-Object System.Collections.Generic.List[string]
foreach ($cod in $map.Keys) {
  $slug = $map[$cod].slug
  $src  = Get-ChildItem -Path (Join-Path $clone $map[$cod].path) -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($src) {
    Copy-Item -LiteralPath $src.FullName -Destination (Join-Path $dest "$slug.svg") -Force
    Write-Host ("OK  {0}  {1,-16} <- {2}" -f $cod, "$slug.svg", $src.Name)
    $updates.Add(("UPDATE bancos SET logotipo = '/banks/{0}.svg' WHERE COD = '{1}';" -f $slug, $cod))
    $ok++
  } else {
    Write-Warning "Origem nao encontrada para COD $cod ($($map[$cod].path)) - pulando"
  }
}

# Regenera o seed SQL a partir do mapa (so com os que realmente foram copiados).
$header = @(
  '-- GERADO por frontend/scripts/download-bank-logos.ps1 - NAO editar a mao.',
  '-- Define bancos.logotipo para os bancos com arte em frontend/public/banks/.',
  '-- Idempotente: UPDATE por COD, pode rodar varias vezes. run_seeds.py roda sempre.'
)
# UTF-8 SEM BOM: o Set-Content -Encoding UTF8 do PowerShell 5.1 grava BOM, e o
# MySQL rejeita o BOM no inicio do script. WriteAllText com UTF8Encoding($false)
# garante saida limpa que o run_seeds.py consegue executar.
$linhas = ($header + $updates) -join "`r`n"
[System.IO.File]::WriteAllText($seedSql, $linhas + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

Write-Host "`n$ok/$($map.Count) logos em: $dest"
Write-Host "Seed regenerado: $seedSql ($($updates.Count) UPDATEs)"
