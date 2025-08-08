<#
.SYNOPSIS
    Script to close unused ports on Windows
.DESCRIPTION
    This script helps identify and close unused ports on a Windows system.
    It's designed to be run by an administrator to enhance security by closing
    potentially vulnerable ports.
.NOTES
    File Name      : close-ports.ps1
    Prerequisite   : PowerShell 5.1 or later
    Copyright 2025 - Your Organization
#>

#Requires -RunAsAdministrator

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    try {
        $tcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($tcpConnection) {
            return $true
        }
        return $false
    }
    catch {
        Write-Host "Error checking port $Port : $_" -ForegroundColor Red
        return $false
    }
}

# Function to get process using a port
function Get-ProcessUsingPort {
    param (
        [int]$Port
    )
    
    try {
        $process = Get-Process -Id (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            return $process
        }
        return $null
    }
    catch {
        Write-Host "Error getting process for port $Port : $_" -ForegroundColor Red
        return $null
    }
}

# Function to close a port by stopping the associated service
function Close-Port {
    param (
        [int]$Port
    )
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Process using port $Port : $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
                
                $confirm = Read-Host "Do you want to stop this process? (Y/N)"
                if ($confirm -eq 'Y' -or $confirm -eq 'y') {
                    try {
                        Stop-Process -Id $process.Id -Force
                        Write-Host "Successfully stopped process $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Green
                        return $true
                    }
                    catch {
                        Write-Host "Failed to stop process: $_" -ForegroundColor Red
                        return $false
                    }
                }
                else {
                    Write-Host "Skipping port $Port" -ForegroundColor Yellow
                    return $false
                }
            }
            else {
                Write-Host "No process found using port $Port" -ForegroundColor Yellow
                return $false
            }
        }
        else {
            Write-Host "Port $Port is not in use" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "Error closing port $Port : $_" -ForegroundColor Red
        return $false
    }
}

# Main script execution
function Start-PortClosure {
    [CmdletBinding()]
    param (
        [int[]]$PortsToClose = @(20, 21) # Default to FTP ports
    )
    
    Write-Host "=== Port Security Tool ===" -ForegroundColor Cyan
    Write-Host "This tool helps close potentially vulnerable ports on your system.\n" -ForegroundColor White
    
    # Check if running as administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Host "This script requires administrator privileges. Please run as administrator." -ForegroundColor Red
        return
    }
    
    # Display current open ports
    Write-Host "Checking for open ports..." -ForegroundColor Cyan
    $openPorts = @()
    
    foreach ($port in $PortsToClose) {
        if (Test-PortInUse -Port $port) {
            $process = Get-ProcessUsingPort -Port $port
            $openPorts += [PSCustomObject]@{
                Port = $port
                Status = "Open"
                Process = if ($process) { "$($process.ProcessName) (PID: $($process.Id))" } else { "Unknown" }
            }
        }
        else {
            $openPorts += [PSCustomObject]@{
                Port = $port
                Status = "Closed"
                Process = "N/A"
            }
        }
    }
    
    # Display results
    $openPorts | Format-Table -AutoSize | Out-String | Write-Host
    
    # Ask user to proceed with closing ports
    $proceed = Read-Host "Do you want to close the open ports? (Y/N)"
    
    if ($proceed -eq 'Y' -or $proceed -eq 'y') {
        Write-Host "\nStarting port closure process..." -ForegroundColor Cyan
        
        foreach ($port in $PortsToClose) {
            Write-Host "\nProcessing port $port..." -ForegroundColor Cyan
            $result = Close-Port -Port $port
            
            if ($result) {
                Write-Host "Port $port has been secured." -ForegroundColor Green
            }
            else {
                Write-Host "Failed to secure port $port. Please check the logs above for details." -ForegroundColor Red
            }
        }
        
        Write-Host "\nPort closure process completed." -ForegroundColor Green
    }
    else {
        Write-Host "\nPort closure cancelled by user." -ForegroundColor Yellow
    }
    
    Write-Host "\n=== Additional Security Recommendations ===" -ForegroundColor Cyan
    Write-Host "1. Use Windows Firewall to block unnecessary incoming/outgoing connections"
    Write-Host "2. Regularly update your operating system and applications"
    Write-Host "3. Disable unused Windows features and services"
    Write-Host "4. Consider using a network security group to restrict access to specific IPs"
    Write-Host "5. Regularly audit your network for open ports and services\n"
}

# Execute the main function
Start-PortClosure -PortsToClose @(20, 21) # FTP ports
