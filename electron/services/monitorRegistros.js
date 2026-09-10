const {
    obtenerNuevosRegistros
} = require('../database/consultas');

let ultimoId = 0;

let consultando = false;


function iniciarMonitor(mainWindow) {

    console.log('Monitor de registros iniciado');

    setInterval(async () => {

        // Evita consultas simultáneas
        if (consultando) {
            return;
        }

        consultando = true;

        try {

            const registros =
                await obtenerNuevosRegistros();

            if (registros.length > 0) {

                console.log(
                    'Nuevos registros:',
                    registros
                );

                // Actualizar último ID procesado
                ultimoId = Math.max(
                    ...registros.map(registro => registro.id)
                );

                // Avisar a Angular
                mainWindow.webContents.send(
                    'nuevos-registros',
                    registros
                );
            }

        } catch (error) {

            console.error(
                'Error consultando nuevos registros:',
                error
            );

        } finally {

            consultando = false;

        }

    }, 2000);

}


module.exports = {
    iniciarMonitor
};