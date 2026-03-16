/**
 * Services routes: CRUD for services (includes custom field values).
 */
const express = require('express');
const router = express.Router();
const servicesService = require('../services/servicesService');

router.get('/', async (req, res, next) => {
  try {
    const services = await servicesService.listServicesWithFields();
    res.json(services);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const service = await servicesService.createServiceWithFields(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const service = await servicesService.updateServiceWithFields(req.params.id, req.body);
    res.json(service);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await servicesService.deleteService(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
