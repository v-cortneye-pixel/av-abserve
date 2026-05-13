export const endpoints = [
    {
        name: 'sfo-735',
        type: 'qHttp',
        ip_address: '10.6.204.14',
        interval: 15000
    },
    {
        name: 'sea-3619',
        type: 'qHttp',
        ip_address: '172.22.204.159',
        interval: 15000
    },
    {
        name: 'sea-3611',
        type: 'qHttp',
        ip_address: '172.22.205.147',
        interval: 15000
    }
];

export const serverConfig = {
    port: process.env.PORT || 3000
};