#!/usr/bin/env pwsh
# Local override: no independent Spec Kit IDs are allowed.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][int]$Issue, [switch]$DryRun)
$arguments = @((Join-Path $PSScriptRoot '../../../scripts/sdd/from-issue.mjs'), "$Issue")
if (-not $DryRun) { $arguments += '--start' }
& node @arguments
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
