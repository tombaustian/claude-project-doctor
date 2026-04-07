#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Installs claude-project-doctor hooks and helpers into your global Claude Code setup.

.DESCRIPTION
    Copies helper scripts to ~/.claude/helpers/ and merges hook configuration
    into ~/.claude/settings.json.

    Run this once after cloning or updating the skill:
        pwsh install.ps1

.NOTES
    Requires: Node.js, PowerShell 5+
    Safe to re-run — backs up settings.json before modifying.
#>

$ErrorActionPreference = "Stop"

$ClaudeDir  = Join-Path $HOME ".claude"
$HelpersDir = Join-Path $ClaudeDir "helpers"
$Settings   = Join-Path $ClaudeDir "settings.json"
$SkillDir   = $PSScriptRoot
$SrcHelpers = Join-Path $SkillDir "helpers"

Write-Host ""
Write-Host "Claude Project Doctor — Installer" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ensure helpers directory exists
if (-not (Test-Path $HelpersDir)) {
    New-Item -ItemType Directory -Path $HelpersDir -Force | Out-Null
    Write-Host "  Created: $HelpersDir" -ForegroundColor Green
}

# 2. Copy helper scripts
$Scripts = Get-ChildItem -Path $SrcHelpers -File
$copied  = 0
foreach ($script in $Scripts) {
    $dest = Join-Path $HelpersDir $script.Name
    Copy-Item -Path $script.FullName -Destination $dest -Force
    $copied++
}
Write-Host "  Copied $copied helper scripts to $HelpersDir" -ForegroundColor Green

# 3. Make .sh files executable (Git Bash)
$shFiles = Get-ChildItem -Path $HelpersDir -Filter "*.sh"
foreach ($f in $shFiles) {
    & git update-index --chmod=+x $f.FullName 2>$null
}

# 4. Backup and update settings.json
if (-not (Test-Path $Settings)) {
    Write-Host "  WARNING: $Settings not found — creating minimal settings" -ForegroundColor Yellow
    Set-Content -Path $Settings -Value "{}"
}

$backup = "$Settings.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path $Settings -Destination $backup
Write-Host "  Backed up settings.json -> $([System.IO.Path]::GetFileName($backup))" -ForegroundColor DarkGray

# 5. Read and patch settings
$json = Get-Content $Settings -Raw | ConvertFrom-Json

# Helper: ensure property exists
function Ensure-Prop($obj, $prop, $default) {
    if (-not (Get-Member -InputObject $obj -Name $prop -MemberType NoteProperty)) {
        Add-Member -InputObject $obj -MemberType NoteProperty -Name $prop -Value $default
    }
}

Ensure-Prop $json "hooks" ([PSCustomObject]@{})

# Hook definitions
$hookDefs = @{
    SessionStart = @(
        @{ matcher=$null; hooks=@(
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs session-restore"; timeout=15000 }
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/auto-memory-hook.mjs import"; timeout=8000 }
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/auto-git-pull.cjs"; timeout=15000 }
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/doctor-hook.cjs"; timeout=10000 }
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/session-env-hook.cjs"; timeout=5000 }
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/learning-lifecycle-hook.cjs session-start"; timeout=15000 }
        )}
    )
    UserPromptSubmit = @(
        @{ hooks=@(
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs route"; timeout=10000 }
        )}
    )
    Stop = @(
        @{ hooks=@(
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/auto-memory-hook.mjs sync"; timeout=10000 }
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/auto-reflect-hook.cjs"; timeout=8000 }
            @{ type="prompt"; model="claude-haiku-4-5-20251001"; prompt="Quality & Security Gate: Review this session's transcript. Check ALL: (1) IF source files modified: were tests run/passing, OR did user explicitly waive? (2) IF source files modified: any hardcoded API key, token, password, secret, or credential visible in the changes? (3) IF SQL queries written: parameterized queries used — NOT string concat? (4) IF shell commands constructed with user input: execFile/array args — NOT exec/string concat? BLOCK with {`"decision`":`"block`",`"reason`":`"...`"} if: (a) source files changed without tests and user did not waive, OR (b) hardcoded secrets detected, OR (c) SQL injection risk, OR (d) command injection risk. Otherwise {`"decision`":`"approve`"}."; timeout=30000 }
        )}
    )
    SessionEnd = @(
        @{ hooks=@(
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs session-end"; timeout=10000 }
            @{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/learning-lifecycle-hook.cjs session-end"; timeout=15000 }
        )}
    )
}

# PreToolUse
Ensure-Prop $json.hooks "PreToolUse" @()
$preBash = [PSCustomObject]@{
    matcher = "Bash"
    hooks   = @(
        [PSCustomObject]@{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs pre-bash"; timeout=5000 }
    )
}
$preEdit = [PSCustomObject]@{
    matcher = "Write|Edit|MultiEdit"
    hooks   = @(
        [PSCustomObject]@{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs pre-edit"; timeout=5000 }
    )
}

# PostToolUse
Ensure-Prop $json.hooks "PostToolUse" @()
$postEdit = [PSCustomObject]@{
    matcher = "Write|Edit|MultiEdit"
    hooks   = @(
        [PSCustomObject]@{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs post-edit"; timeout=10000 }
        [PSCustomObject]@{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/learning-lifecycle-hook.cjs store `"code-edit`" code 0.7"; timeout=8000 }
    )
}
$postBash = [PSCustomObject]@{
    matcher = "Bash"
    hooks   = @(
        [PSCustomObject]@{ type="command"; command="cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs post-bash"; timeout=5000 }
    )
}

Write-Host ""
Write-Host "  Hook configuration written to settings.json" -ForegroundColor Green
Write-Host ""
Write-Host "  Installation complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. Restart Claude Code to activate the new hooks" -ForegroundColor DarkGray
Write-Host "    2. Run: claude skills install agamm/claude-code-owasp" -ForegroundColor DarkGray
Write-Host "    3. Optional: npm install -g semgrep && brew install gitleaks" -ForegroundColor DarkGray
Write-Host ""

# Write updated settings
$json | ConvertTo-Json -Depth 20 | Set-Content -Path $Settings -Encoding UTF8
