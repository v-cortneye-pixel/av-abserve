import { Client } from 'ssh2';
import { getCredentials } from '../credentials.js';

class JuniperSwitch {
  constructor(switchName, options = {}) {
    this.switchName = switchName;
    
    // Use provided hostname or build from switchName
    if (options.hostname) {
      this.hostname = options.hostname;
    } else if (options.useDirectConnection) {
      this.hostname = switchName; // Use switchName as IP directly
    } else {
      this.hostname = `${switchName}.net.zillowgroup.net`; // Default behavior
    }
    
    // Set timeout values (with defaults)
    this.timeouts = {
      handshake: options.handshakeTimeout || 20000,
      connection: options.connectionTimeout || 30000,
      stream: options.streamTimeout || 120000
    };
    
    // Get credentials using the shared system
    const credentials = getCredentials('juniper');
    this.username = credentials.username;
    this.password = credentials.password;
    this.conn = new Client();
  }

  async connect() {
    const config = {
      host: this.hostname,
      port: 22,
      username: this.username,
      password: this.password,
      readyTimeout: this.timeouts.handshake,
      keepaliveInterval: 1000 // Keep connection alive
    };
    
    return new Promise((resolve, reject) => {
      // Set a maximum timeout for the entire connection process
      const connectionTimeout = setTimeout(() => {
        this.conn.destroy();
        reject(new Error(`SSH connection timeout after ${this.timeouts.connection}ms for ${this.hostname}`));
      }, this.timeouts.connection);

      this.conn
        .on('ready', () => {
          clearTimeout(connectionTimeout);
          resolve(this.conn);
        })
        .on('error', (err) => {
          clearTimeout(connectionTimeout);
          reject(new Error(`SSH connection error for ${this.hostname}: ${err.message}`));
        })
        .connect(config);
    });
  }

  async openShell() {
    return new Promise((resolve, reject) => {
      this.conn.shell((err, stream) => {
        if (err) reject(new Error(`Shell error for ${this.hostname}: ${err.message}`));
        else resolve(stream);
      });
    });
  }

  async processStream(stream, commands, options = {}) {
    // Handle both single command (string) and multiple commands (array)
    const commandArray = Array.isArray(commands) ? commands : [commands];
    const mainPrompt = new RegExp(options.mainPrompt || `${this.username}@[^>]+>`, "gi");
    
    return new Promise((resolve, reject) => {
      stream.setEncoding('utf8');
      
      let allData = "";
      let currentCommandIndex = 0;
      let responses = [];
      let currentResponse = "";
      let promptCount = 0;
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        stream.destroy();
        this.conn.end();
        reject(new Error(`Stream processing timeout after ${this.timeouts.stream}ms for ${this.hostname}`));
      }, this.timeouts.stream);
      
      const sendNextCommand = () => {
        if (currentCommandIndex < commandArray.length) {
          const command = commandArray[currentCommandIndex];
          stream.write(`${command} | no-more\n`);
        }
      };
      
      stream.on('data', (data) => {
        allData += data;
        currentResponse += data;
        
        const promptMatches = allData.match(mainPrompt);
        
        if (promptMatches && promptMatches.length > promptCount) {
          promptCount = promptMatches.length;
          
          // First prompt = ready to send first command
          if (promptCount === 1 && currentCommandIndex === 0) {
            sendNextCommand();
          }
          // Subsequent prompts = command completed
          else if (promptCount > 1) {
            // Save the response for the current command
            responses.push(currentResponse);
            currentResponse = "";
            currentCommandIndex++;
            
            // Send next command or finish
            if (currentCommandIndex < commandArray.length) {
              sendNextCommand();
            } else {
              // All commands completed
              clearTimeout(timeout);
              setTimeout(() => {
                try {
                  stream.destroy();
                  this.conn.end();
                  // Return single response for single command, array for multiple
                  resolve(commandArray.length === 1 ? responses[0] : responses);
                } catch (e) {
                  reject(new Error(`Stream cleanup error for ${this.hostname}: ${e.message}`));
                }
              }, 50);
            }
          }
        }
      });

      stream.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`Stream error for ${this.hostname}: ${err.message}`));
      });
    });
  }

  async switchConfig(options = {}) {
    try {
      await this.connect();
      const stream = await this.openShell();
      const output = await this.processStream(stream, 'show configuration', options);
      return output;
    } catch (error) {
      console.error(`Error showing config for ${this.hostname}: ${error.message}`);
      throw error;
    }
  }

  async arpTable(options = {}) {
    try {
      //get raw data
      await this.connect();
      const stream = await this.openShell();
      const rawOutput = await this.processStream(stream, 'show arp', options);

      return this.parseArpOutput(rawOutput);
    } catch (error) {
      console.error(`Error showing ARP for ${this.hostname}: ${error.message}`);
      throw error;
    }
  }

  parseInterfaceInfo(interfaceString) {
    // Extract switch and port from interface string like 'irb.2204 [ge-0/0/1.0]' or 'ge-0/0/1.0'
    const interfaceMatch = interfaceString.match(/ge-(\d+)\/0\/(\d+)\.0/);
    
    if (interfaceMatch) {
      return {
        Switch: parseInt(interfaceMatch[1]),
        Port: parseInt(interfaceMatch[2])
      };
    }
    
    return null;
  }

  async switchPorts(options = {}) {
    // Get both ARP and MAC data
    const { arpData, macData } = await this.getArpAndMacData(options);
    
    // Process ARP data (primary source with IP addresses)
    const arpPorts = arpData
      .filter(entry => entry.Interface.includes('ge-'))
      .map(entry => {
        const interfaceInfo = this.parseInterfaceInfo(entry.Interface);
        
        if (interfaceInfo) {
          return {
            ...entry,
            Switch: interfaceInfo.Switch,
            Port: interfaceInfo.Port
          };
        }
        
        return entry;
      })
      .filter(entry => entry.Switch !== undefined && entry.Port !== undefined);
    
    // Find MAC entries that don't exist in ARP data (by MAC address)
    const macOnlyPorts = macData
      .filter(macEntry => macEntry.Switch !== undefined && macEntry.Port !== undefined)
      .filter(macEntry => {
        // Check if this specific MAC address exists in ARP data
        return !arpPorts.some(arpEntry => 
          arpEntry.MAC_Address === macEntry.MAC_Address
        );
      })
      .map(macEntry => ({
        MAC_Address: macEntry.MAC_Address,
        IP_Address: '', // Blank IP for MAC-only entries
        Name: '', // No name available from MAC table
        Interface: macEntry.Logical_Interface || `ge-${macEntry.Switch}/0/${macEntry.Port}.0`,
        Switch: macEntry.Switch,
        Port: macEntry.Port
      }));
    
    // Combine ARP and MAC-only data, then sort
    return [...arpPorts, ...macOnlyPorts]
      .sort((a, b) => {
        // Sort by Switch first
        if (a.Switch !== b.Switch) {
          return a.Switch - b.Switch;
        }
        // Then sort by Port
        return a.Port - b.Port;
      });
  }

  async macTable(options = {}) {
    try {
      // Get raw data
      await this.connect();
      const stream = await this.openShell();
      const rawOutput = await this.processStream(stream, 'show ethernet-switching table', options);

      return this.parseMacTableOutput(rawOutput);
    } catch (error) {
      console.error(`Error showing MAC table for ${this.hostname}: ${error.message}`);
      throw error;
    }
  }

  parseMacTableOutput(rawOutput) {
    const macEntries = [];
    const lines = rawOutput.split('\n');
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines, header lines, MAC flags description, and command lines
      if (!trimmedLine || 
          trimmedLine.includes('MAC flags') || 
          trimmedLine.includes('SE - statistics') ||
          trimmedLine.includes('Ethernet switching table') ||
          trimmedLine.includes('Routing instance') ||
          trimmedLine.includes('Vlan') ||
          trimmedLine.includes('name') ||
          trimmedLine.includes('show ethernet-switching') ||
          trimmedLine.includes('av-team@') ||
          trimmedLine.includes('{master:')) {
        continue;
      }

      // Parse the line - split by whitespace
      const parts = trimmedLine.split(/\s+/);
      
      if (parts.length >= 5) {
        const vlanName = parts[0];
        const macAddress = parts[1];
        // Skip MAC flags (parts[2]) and Age (parts[3]) as requested
        const logicalInterface = parts[4];
        
        // Parse switch and port from logical interface
        const interfaceInfo = this.parseInterfaceInfo(logicalInterface);
        
        const entry = {
          VLAN: vlanName,
          MAC_Address: macAddress
        };
        
        // Add switch and port if parseable, otherwise keep original interface
        if (interfaceInfo) {
          entry.Switch = interfaceInfo.Switch;
          entry.Port = interfaceInfo.Port;
        } else {
          entry.Logical_Interface = logicalInterface;
        }
        
        macEntries.push(entry);
      }
    }
    
    return macEntries;
  }

  async getArpAndMacData(options = {}) {
    try {      
      // Open single session and run both commands
      await this.connect();
      const stream = await this.openShell();
      const [arpResponse, macResponse] = await this.processStream(stream, [
        'show arp',
        'show ethernet-switching table'
      ], options);
      
      // Parse both responses
      const arpData = this.parseArpOutput(arpResponse);
      const macData = this.parseMacTableOutput(macResponse);
      
      return { arpData, macData };
    } catch (error) {
      console.error(`Error getting ARP and MAC data for ${this.hostname}: ${error.message}`);
      throw error;
    }
  }

  parseArpOutput(rawOutput) {
    const arpEntries = [];
    const lines = rawOutput.split('\n');
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines, header line, and total entries line
      if (!trimmedLine || 
          trimmedLine.includes('MAC Address') || 
          trimmedLine.includes('show arp') ||
          trimmedLine.includes('av-team@')) {
        continue;
      }

      // Parse the line - split by whitespace but be careful with the interface column
      const parts = trimmedLine.split(/\s+/);
      
      if (parts.length >= 5) {
        const macAddress = parts[0];
        const address = parts[1];
        const name = parts[2];
        
        // Interface is everything from index 3 until the last part (which is flags)
        // Join all parts except the first 3 and the last one
        const interfaceParts = parts.slice(3, -1);
        const interfaceValue = interfaceParts.join(' ');
        
        arpEntries.push({
          MAC_Address: macAddress,
          IP_Address: address,
          Name: name,
          Interface: interfaceValue
        });
      }
    }
    
    return arpEntries;
  }

}

export default JuniperSwitch;
