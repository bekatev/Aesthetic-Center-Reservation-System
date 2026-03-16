/**
 * Custom field routes: list columns, create field, update column order, delete field.
 */
const express = require('express');
const router = express.Router();
const serviceFieldsService = require('../services/serviceFieldsService');

router.get('/', async (req, res, next) => {
  try {
    const columns = await serviceFieldsService.getColumnDefinitions();
    res.json(columns);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const field = await serviceFieldsService.createCustomField(name);
    res.status(201).json(field);
  } catch (err) {
    next(err);
  }
});

router.put('/column-order', async (req, res, next) => {
  try {
    const { order } = req.body;
    await serviceFieldsService.updateColumnOrder(order);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await serviceFieldsService.deleteCustomField(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
