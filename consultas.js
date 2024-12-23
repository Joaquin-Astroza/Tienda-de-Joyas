import pkg from 'pg';

import format from 'pg-format';

const { Pool } = pkg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'root',
    database: 'joyas',
    port: 5432,
    allowExitOnIdle: true
});


export const obtenerJoyas = async ({ limits = 3, order_by =
    "id_ASC", page = 1 }) => {
    try {
        const [campo, direccion] = order_by.split("_")
        const offset = (page - 1) * limits
        const formattedQuery = format('SELECT * FROM inventario order by %s %s LIMIT %s  OFFSET %s', campo, direccion, limits, offset);
        const { rows: inventario } = await pool.query(formattedQuery);
        return inventario;
    } catch (error) {
        console.error("Error obteniendo joyas:", error.message);
        throw error;
    }
}
export const obtenerJoyasPorFiltros = async ({ precio_max, precio_min, categoria, metal }) => {
    let filtros = []
    if (precio_max) filtros.push(`precio <= ${precio_max}`);
    if (precio_min) filtros.push(`precio >= ${precio_min}`);
    if (categoria) filtros.push(`categoria <= '${categoria}`);
    if (metal) filtros.push(`metal = '${metal}'`);


    let consulta = "SELECT * FROM inventario"
    if (filtros.length > 0) {
        filtros = filtros.join(" AND ")
        consulta += ` WHERE ${filtros}`
    }
    try {
        const { rows: joyas } = await pool.query(consulta);
        return joyas;
    } catch (error) {
        console.error("Error obteniendo joyas por filtros:", error.message);
        throw error;
    }
}

export const prepararHATEOAS = (inventario) => {
    try {
        const results = inventario.map((joya) => {
            return {
                name: joya.nombre,
                precio: joya.precio,
                links: {
                    self: `/joyas/${joya.id}`,
                    filtros: `/joyas/filtros?metal=${joya.metal}&categoria=${joya.categoria}`
                }
            }
        })
        const total = inventario.length
        const HATEOAS = {
            total,
            results
        }
        return HATEOAS
    } catch (error) {
        console.error("Error generando HATEOAS:", error.message);
        throw new Error("Ocurrió un error al preparar la respuesta HATEOAS");
    }
}


