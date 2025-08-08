// This is a simplified port scanner for demonstration
// In production, you might want to use a more robust solution

const net = require('net');

// Function to check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
};

// Function to get process info using a port (Windows specific)
const getProcessUsingPort = async (port) => {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const command = `netstat -ano | findstr :${port}`;
    const { stdout } = await execAsync(command);
    
    if (stdout) {
      const lines = stdout.trim().split('\n');
      const pids = [...new Set(lines.map(line => line.trim().split(/\s+/).pop()))];
      
      const processes = await Promise.all(
        pids.map(async (pid) => {
          try {
            const { stdout: taskOutput } = await execAsync(`tasklist /FI "PID eq ${pid}"`);
            const processName = taskOutput.split('\n').find(line => line.includes(pid))?.split(/\s+/)[0];
            return { pid, name: processName || 'Unknown' };
          } catch (error) {
            return { pid, name: 'Unknown' };
          }
        })
      );
      
      return processes;
    }
    return [];
  } catch (error) {
    console.error('Error getting process info:', error);
    return [];
  }
};

// Generate a port scan report
export const generatePortReport = async () => {
  const portsToCheck = [20, 21, 80, 443, 3000, 5000, 8000];
  const results = [];
  
  for (const port of portsToCheck) {
    const inUse = await isPortInUse(port);
    let processes = [];
    
    if (inUse) {
      processes = await getProcessUsingPort(port);
    }
    
    results.push({
      port,
      inUse,
      processes
    });
  }
  
  return results;
};

// Format the report as text
export const formatPortReport = (results) => {
  let report = 'Port Scan Report\n';
  report += '='.repeat(50) + '\n\n';
  
  results.forEach(({ port, inUse, processes }) => {
    report += `Port ${port}: ${inUse ? 'IN USE' : 'Available'}\n`;
    
    if (inUse && processes && processes.length > 0) {
      report += '  Processes using this port:\n';
      processes.forEach(proc => {
        report += `  - PID: ${proc.pid}, Name: ${proc.name || 'Unknown'}\n`;
      });
    }
    
    report += '\n';
  });
  
  report += '\nSecurity Recommendations:\n';
  report += '1. Close any unnecessary open ports\n';
  report += '2. If FTP (ports 20,21) is not needed, disable the FTP service\n';
  report += '3. Use a firewall to restrict access to open ports\n';
  
  return report;
};
