import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class NetworkValidator {
    constructor() {
        this.timeouts = {
            ping: 5000,    // 5 seconds per ping
            total: 30000   // 30 seconds total validation timeout
        };
    }

    async ping(host, count = 2) {
        try {
            // Use -c for count, -W for timeout (in seconds)
            const { stdout, stderr } = await execAsync(`ping -c ${count} -W 3 ${host}`);
            
            // Extract packet loss and avg time from ping output
            const lines = stdout.split('\n');
            const statsLine = lines.find(line => line.includes('packet loss'));
            const timeLine = lines.find(line => line.includes('min/avg/max'));
            
            let packetLoss = 100;
            let avgTime = null;
            
            if (statsLine) {
                const lossMatch = statsLine.match(/(\d+)% packet loss/);
                if (lossMatch) packetLoss = parseInt(lossMatch[1]);
            }
            
            if (timeLine) {
                const timeMatch = timeLine.match(/min\/avg\/max\/mdev = [\d.]+\/([\d.]+)\//);
                if (timeMatch) avgTime = parseFloat(timeMatch[1]);
            }
            
            return {
                host,
                reachable: packetLoss < 100,
                packetLoss,
                avgTime,
                success: packetLoss === 0
            };
        } catch (error) {
            return {
                host,
                reachable: false,
                packetLoss: 100,
                avgTime: null,
                success: false,
                error: error.message
            };
        }
    }

    async validateNetworkTargets(targets) {
        console.log(`Starting network validation for ${targets.length} targets...`);
        const results = [];
        
        for (const target of targets) {
            const result = await this.ping(target.host || target.ip || target);
            results.push({
                ...result,
                type: target.type || 'unknown',
                description: target.description || target.host || target.ip || target
            });
            
            const status = result.success ? 'OK' : result.reachable ? 'SLOW' : 'FAIL';
            const timeInfo = result.avgTime ? ` (${result.avgTime}ms)` : '';
            const description = target.description || target.host || target.ip || target;
            console.log(`  ${status}: ${description}${timeInfo}`);
        }
        
        // Summary
        const ok = results.filter(r => r.success).length;
        const slow = results.filter(r => r.reachable && !r.success).length;
        const failed = results.filter(r => !r.reachable).length;
        console.log(`Network validation complete: ${ok} OK, ${slow} slow, ${failed} failed`);
        
        return results;
    }

    async validateCriticalInfrastructure() {
        // Load config from the shared location
        const configPath = new URL('../config.json', import.meta.url).pathname;
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        const targets = [];
        const isCI = process.env.CI || process.env.GITLAB_CI;
        
        // Only add gateway IPs from IP schedule configuration (CI can't reach internal switches)
        if (config.ipSheet?.tabs) {
            config.ipSheet.tabs.forEach(tab => {
                targets.push({
                    host: tab.GatewayIp,
                    type: 'gateway',
                    description: `${tab.Tab} Gateway (${tab.GatewayIp})`
                });
                
                // Only test switches locally, not in CI
                if (!isCI) {
                    targets.push({
                        host: `${tab.Host}.net.zillowgroup.net`,
                        type: 'switch',
                        description: `${tab.Tab} Switch (${tab.Host})`
                    });
                }
            });
        }
        
        // No external connectivity tests - focus only on internal infrastructure
        
        console.log(`Network validation mode: ${isCI ? 'CI (gateways only)' : 'Local (gateways + switches)'}`);
        
        return await this.validateNetworkTargets(targets);
    }

    generateSlackReport(results) {
        const failed = results.filter(r => !r.reachable);
        const slow = results.filter(r => r.reachable && !r.success && r.avgTime > 100);
        
        if (failed.length === 0 && slow.length === 0) {
            return null; // No issues to report
        }
        
        let report = `**🌐 Network Infrastructure Issues:**\n`;
        
        if (failed.length > 0) {
            report += `❌ **${failed.length} Failed Connection${failed.length > 1 ? 's' : ''}:**\n`;
            failed.forEach(result => {
                report += `• ${result.description}\n`;
            });
            report += '\n';
        }
        
        if (slow.length > 0) {
            report += `⚠️ **${slow.length} Slow Connection${slow.length > 1 ? 's' : ''}:**\n`;
            slow.forEach(result => {
                report += `• ${result.description} (${result.avgTime}ms)\n`;
            });
        }
        
        return report.trim();
    }

    generateSplunkData(results) {
        return results.map(result => ({
            host: result.host,
            type: result.type,
            description: result.description,
            reachable: result.reachable,
            packetLoss: result.packetLoss,
            avgTime: result.avgTime,
            success: result.success,
            error: result.error || null,
            timestamp: new Date().toISOString(),
            event: 'network.validation'
        }));
    }
}

export default NetworkValidator;
