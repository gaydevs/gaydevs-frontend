# Test-only launcher: real PowerShell and helpers, guarded command discovery.
param([Parameter(Mandatory=$true)][string]$Request)
$ErrorActionPreference = 'Stop'
# Helpers and native Node wrappers communicate through UTF-8 pipes.
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
if (-not $env:SDD_SANDBOX_BASE -or $env:GH_BIN -ne (Join-Path $env:SDD_SANDBOX_BASE 'fake-gh') -or $env:GIT_ALLOW_PROTOCOL -ne 'file') {
    throw 'SDD SANDBOX BLOCKED: mandatory fake/transport guard missing'
}
$job = Get-Content -Raw -LiteralPath $Request | ConvertFrom-Json
$base = [IO.Path]::GetFullPath($env:SDD_SANDBOX_BASE) + [IO.Path]::DirectorySeparatorChar
if (-not [IO.Path]::GetFullPath($job.script).StartsWith($base)) { throw 'SDD SANDBOX BLOCKED: script outside fixture' }

# AST audit supplements runtime command guards for direct .NET access. The
# installed helpers may use filesystem APIs, but never legacy feature state or
# .NET network/process escape APIs. This is not an OS hostile-code sandbox.
$sources = @(Get-ChildItem -LiteralPath (Join-Path $job.repo '.specify/scripts') -Recurse -Filter '*.ps1')
$sources += Get-Item -LiteralPath $job.script
foreach ($source in $sources) {
    $tokens = $null; $parseErrors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($source.FullName, [ref]$tokens, [ref]$parseErrors)
    if ($parseErrors.Count) { throw "SDD SANDBOX BLOCKED: invalid PowerShell $($source.FullName)" }
    $forbidden = $ast.FindAll({ param($node)
        ($node -is [System.Management.Automation.Language.StringConstantExpressionAst] -and
            $node.Value -match 'feature\.json|(?:\.specify[/\\])?context[/\\]|^(System\.)?(Net\.|Diagnostics\.Process|Reflection\.)') -or
        ($node -is [System.Management.Automation.Language.TypeExpressionAst] -and
            $node.TypeName.FullName -match '^(System\.)?(Net\.|Diagnostics\.Process|Reflection\.)')
    }, $true)
    if ($forbidden.Count) { throw "SDD SANDBOX BLOCKED: legacy state/network/process API in $($source.FullName)" }
}
$ExecutionContext.InvokeCommand.PreCommandLookupAction = {
    param($sender, $eventArgs)
    $name = $eventArgs.CommandName
    $allowed = $name -in @('Get-Command','Write-Output','Test-Path','Resolve-Path','Split-Path','Join-Path',
        'Get-Location','ConvertFrom-Json','ConvertTo-Json','New-Object','Get-ChildItem','Where-Object',
        'Select-Object','Sort-Object','ForEach-Object','New-Item','Out-Null','Remove-Item',
        'Get-RepoRoot','Find-SpecifyRoot','Resolve-SpecifyInitDir','Get-CurrentBranch','Get-FeaturePathsEnv',
        'Resolve-Template','Resolve-TemplateContent','Get-SortedExtensionIds','Get-NormalizedPriority',
        'Test-FileExists','Test-DirHasFiles','Get-InvokeSeparator','Format-SpecKitCommand','Get-Python3Command',
        'git','node') -or $name -eq $env:SDD_GIT_BIN -or $name -eq $env:SDD_NODE_BIN
    if (-not $allowed -and $name.EndsWith('.ps1') -and [IO.Path]::GetFullPath($name).StartsWith($base)) { $allowed = $true }
    if (-not $allowed) {
        $eventArgs.CommandScriptBlock = { throw 'SDD SANDBOX BLOCKED: command outside helper allowlist (real gh/network forbidden)' }
        $eventArgs.StopSearch = $true
    }
}
try {
    if ($job.common) {
        . $job.script
        Get-FeaturePathsEnv | ConvertTo-Json -Compress
    } else {
        $arguments = @($job.arguments | ForEach-Object { [string]$_ })
        $named = @{}
        $positional = @()
        for ($i = 0; $i -lt $arguments.Count; $i++) {
            if ($arguments[$i].StartsWith('-')) {
                $key = $arguments[$i].TrimStart('-')
                if ($i + 1 -lt $arguments.Count -and -not $arguments[$i + 1].StartsWith('-')) {
                    $i++; $named[$key] = $arguments[$i]
                } else { $named[$key] = $true }
            } else { $positional += $arguments[$i] }
        }
        & $job.script @named @positional
        # An invoked script's "exit 1" returns to this launcher. Propagate it
        # instead of letting the launcher's successful finally hide failure.
        if (-not $?) { exit 1 }
    }
} finally {
    $ExecutionContext.InvokeCommand.PreCommandLookupAction = $null
}
