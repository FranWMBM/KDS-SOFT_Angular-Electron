const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'National09',
    server: 'TERMINAL-S8',
    port: 1433,
    database: 'softrestaurant8pro',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool;

async function conectar() {

    if (pool) {
        return pool;
    }

    pool = await sql.connect(config);

    console.log('Conectado a la BD');

    return pool;
}

module.exports = {
    conectar
};