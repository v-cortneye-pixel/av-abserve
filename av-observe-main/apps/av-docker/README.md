# AV Docker - Prometheus Metrics Exporter

**DEPRECATED: This application is deprecated in favor of the more comprehensive [av-daily-update](../av-daily-update/) approach.**

This service was an early implementation that scraped Q-SYS metrics and converted them to Prometheus format for monitoring dashboards. While functional, it has been superseded by the more comprehensive daily monitoring and Splunk analytics approach used in av-daily-update.

## What It Does

The av-docker application provides:
- **Q-SYS Metrics Collection**: Scrapes system metrics from Q-SYS cores
- **Prometheus Export**: Converts metrics to Prometheus format at `/metrics` endpoint
- **Containerized Deployment**: Docker-based deployment with Prometheus included
- **Health Monitoring**: Basic health check endpoint at `/health`

## Architecture

```
Q-SYS Cores → Metrics Exporter → Prometheus → Grafana Dashboards
```

### Components
1. **Metrics Exporter**: Node.js service that collects Q-SYS metrics
2. **Prometheus**: Time-series database for metrics storage
3. **Docker Compose**: Orchestrates both services

## Setup & Usage

### Prerequisites
- Docker Desktop for Mac
- Access to Q-SYS network endpoints

### Installation & Deployment
```bash
# 1. Build the Docker image from monorepo root
cd /path/to/av-observe
docker build -f apps/av-docker/dockerfile -t av-metrics-exporter .

# 2. Navigate to av-docker directory
cd apps/av-docker

# 3. Start services with Docker Compose
docker-compose up

# 4. Access services
# Metrics Exporter: http://localhost:3000/metrics
# Prometheus: http://localhost:9090
```

### Available Endpoints

#### Metrics Exporter (Port 3000)
- **`/metrics`** - Prometheus-formatted Q-SYS metrics
- **`/health`** - Service health check

#### Prometheus (Port 9090)
- **Web UI** - Prometheus query interface and configuration
- **API Endpoints** - Standard Prometheus API for queries and administration

### Configuration

#### `config.js`
```javascript
export default {
  qsysCores: [
    { name: 'Core-1', ip: '192.168.1.100' },
    { name: 'Core-2', ip: '192.168.1.101' }
  ],
  scrapeInterval: 30000, // 30 seconds
  port: 3000
};
```

#### `prometheus.yml`
```yaml
global:
  scrape_interval: 30s

scrape_configs:
  - job_name: 'qsys-metrics'
    static_configs:
      - targets: ['metrics-exporter:3000']
```

## Metrics Collected

### Q-SYS System Metrics
- **CPU Usage**: Processor utilization percentage
- **Memory Usage**: RAM utilization and available memory
- **Temperature**: Core and system temperature readings
- **Network**: Interface statistics and throughput
- **Script Status**: Running script health and error counts

### Example Prometheus Metrics
```
# HELP qsys_cpu_usage_percent Q-SYS Core CPU usage percentage
# TYPE qsys_cpu_usage_percent gauge
qsys_cpu_usage_percent{core="IRV-Core-1"} 25.4

# HELP qsys_memory_usage_percent Q-SYS Core memory usage percentage  
# TYPE qsys_memory_usage_percent gauge
qsys_memory_usage_percent{core="IRV-Core-1"} 42.1

# HELP qsys_temperature_celsius Q-SYS Core temperature in Celsius
# TYPE qsys_temperature_celsius gauge
qsys_temperature_celsius{core="IRV-Core-1",sensor="processor"} 45.2
```

## Management Commands

### Docker Operations
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose down
docker build -f dockerfile -t av-metrics-exporter . 
docker-compose up
```

### Automated Scripts
```bash
# Redeploy script (from monorepo root)
npm run script:reboot-docker

# Direct application run (from monorepo root)
npm run app:docker
```

## Deprecation Notice

### Why Deprecated?
1. **Limited Scope**: Only handles Q-SYS metrics, missing Zoom, Domotz, and other integrations
2. **Maintenance Overhead**: Requires separate Prometheus/Grafana infrastructure
3. **Data Silos**: Creates isolated metrics that don't integrate with broader AV monitoring
4. **Scaling Challenges**: Difficult to extend to new systems and use cases

### Migration Path
**Recommended**: Use [av-daily-update](../av-daily-update/) instead, which provides:
- **Comprehensive Coverage**: All AV systems in one platform
- **Splunk Analytics**: Enterprise-grade analytics and alerting  
- **Slack Integration**: Immediate actionable reports
- **Auto-Remediation**: Automatic issue resolution
- **Centralized Management**: Single application for all monitoring needs

### If You Must Use This Application
While deprecated, this application still functions for basic Q-SYS monitoring:

1. **Limited Use Cases**: Basic Q-SYS metrics collection only
2. **No New Features**: No ongoing development or feature additions
3. **Minimal Support**: Use av-daily-update for production monitoring
4. **Migration Recommended**: Plan transition to comprehensive monitoring solution

## Troubleshooting

### Common Issues

#### Module Not Found Errors
```bash
# Ensure building from monorepo root
cd /path/to/av-observe
npm install
docker build -f apps/av-docker/dockerfile -t av-metrics-exporter .
```

#### Q-SYS Connection Issues
```bash
# Check network connectivity
ping <qsys-core-ip>

# Verify Q-SYS HTTP API is enabled
# Check firewall rules for port access
```

#### Docker Compose Issues
```bash
# Clean rebuild
docker-compose down
docker system prune -f
docker build -f dockerfile -t av-metrics-exporter .
docker-compose up
```

### Monitoring Health
```bash
# Check metrics endpoint
curl http://localhost:3000/metrics

# Check health endpoint  
curl http://localhost:3000/health

# View Prometheus targets
# Navigate to http://localhost:9090/targets
```

## Performance Characteristics

### Resource Usage
- **Memory**: ~50-100MB per container
- **CPU**: Minimal (< 5% on modern systems)
- **Network**: Low bandwidth requirements
- **Storage**: Prometheus data grows over time

### Scaling Limitations
- **Single Instance**: No horizontal scaling support
- **Manual Configuration**: Requires manual addition of new Q-SYS cores
- **Limited Metrics**: Basic system metrics only
- **No Auto-Discovery**: Cannot automatically discover new systems

---

**Recommendation**: For production AV monitoring, use the comprehensive [av-daily-update](../av-daily-update/) application instead of this deprecated Docker-based approach. The daily update provides superior coverage, integration, and operational capabilities while requiring less infrastructure maintenance.