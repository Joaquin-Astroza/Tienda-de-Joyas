import express from 'express';
import cors from 'cors';
import { obtenerJoyas, obtenerJoyasPorFiltros, prepararHATEOAS } from './consultas.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


app.get('/joyas', async (req, res) => {
    const queryStrings = req.query
    try {
        const joyas = await obtenerJoyas(queryStrings)
        const HATEOAS = await prepararHATEOAS(joyas)
        res.json(HATEOAS)
    } catch (error) {
        console.error('Error obteniendo joyas:', error);
        res.status(500).json({ error: "Ocurrió un error al obtener las joyas" });
    }
})

app.get('/joyas/filtros', async (req, res) => {
    try {
        const filtros = req.query;
        const joyas = await obtenerJoyasPorFiltros(filtros);
        res.json(joyas);
    } catch (error) {
        res.status(500).json({ error: "Ocurrió un error al obtener las joyas por filtros" });
    }
});
app.get("*", (req, res) => {
    res.status(404).send("Esta ruta no existe")
})
