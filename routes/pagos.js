const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /planes
router.get('/planes', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM planes');
  res.json(rows);
});

// POST /pago
router.post('/pago', async (req, res) => {
  const { usuario_id, plan_id, monto, estado, metodo_pago, referencia_ext } = req.body;

  if (!usuario_id || !plan_id || !monto || !estado) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO pagos (usuario_id, plan_id, monto, estado, metodo_pago, referencia_ext)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [usuario_id, plan_id, monto, estado, metodo_pago || null, referencia_ext || null]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

// GET /pagos/:usuarioId
router.get('/pagos/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  const [rows] = await db.query(`
    SELECT * FROM pagos
    WHERE usuario_id = ?
    ORDER BY fecha_pago DESC
  `, [usuarioId]);

  res.json(rows);
});

module.exports = router;
