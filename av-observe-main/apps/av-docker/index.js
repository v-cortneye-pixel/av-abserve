// src/index.js
import express from 'express';
import promClient from 'prom-client';
import QSysClient from '@av-observe/shared/modules/qHttp.js';
import { endpoints, serverConfig } from './config.js';

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Create a simple logger
const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

// Create metrics for tracking scrapes (these stay the same)
const scrapeCounter = new promClient.Counter({
    name: 'av_observe_scrape_total',
    help: 'Total number of scrapes',
    labelNames: ['endpoint'],
    registers: [register]
});

const scrapeErrors = new promClient.Counter({
    name: 'av_observe_scrape_errors_total',
    help: 'Total number of failed scrapes',
    labelNames: ['endpoint'],
    registers: [register]
});

// Create a Map to store our Gauge metrics
const gaugeMetrics = new Map();

// Function to get or create a Gauge metric
const getOrCreateGauge = (metricName, category) => {
    if (!gaugeMetrics.has(metricName)) {
        const gauge = new promClient.Gauge({
            name: metricName,
            help: `metric for ${category}`,
            labelNames: ['endpoint', 'category'],
            registers: [register]
        });
        gaugeMetrics.set(metricName, gauge);
    }
    return gaugeMetrics.get(metricName);
};

// Scrape function
const scrapeQsysMetrics = async (endpoint) => {
    try {
        const client = new QSysClient(endpoint.ip_address);
        
        const data = await client.getCustomMetrics();

        for (let datum of data) {
            const name = datum.name
            .replace(/[-\.]/g, "_");
            const value = typeof(datum.value) == "number" ? datum.value : 0;
            console.log(name, value);
            const gauge = getOrCreateGauge(name, datum.type);
            gauge.set({endpoint: endpoint.name, category: datum.type}, value) 
        };
        scrapeCounter.inc({ endpoint: endpoint.name });
        log(`Successfully scraped metrics from ${endpoint.name}`);

    } catch (error) {
        scrapeErrors.inc({ endpoint: endpoint.name });
        log(`Error scraping ${endpoint.name}: ${error.message}`);
    }
};


// Start scraping for each endpoint
endpoints.forEach(endpoint => {
    if (endpoint.type === 'qHttp') {
        // Initial scrape
        scrapeQsysMetrics(endpoint);
        
        // Set up interval for subsequent scrapes
        setInterval(() => {
            scrapeQsysMetrics(endpoint);
        }, endpoint.interval);
    }
});


//api server
const app = express();

// Add this new endpoint to see all current metrics
app.get('/debug-metrics', async (req, res) => {
    const metrics = await register.getMetricsAsJSON();
    console.log('Current metrics:', metrics);
    res.json(metrics);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


// Start the server
app.listen(serverConfig.port, () => {
    log(`Server started on port ${serverConfig.port}`);
});