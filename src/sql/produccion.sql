SELECT
    p.descripcion,
    pp.idproducto,
    pp.idmonitor,
    pp.folio,
    pp.movimiento,
    pp.cantidad,
    pp.comentario,
    pp.tiempo,
    pp.hora,
    pp.modificador,
    pp.estadomonitor,
    pp.idproductocompuesto,
    pp.productocompuestoprincipal,
    pp.minutospreparacion,
    pp.minutosalerta,
    pp.horaproduccion,
    pp.cancelado
FROM
    productosenproduccion as pp
    INNER JOIN productos as p ON p.idproducto = pp.idproducto;