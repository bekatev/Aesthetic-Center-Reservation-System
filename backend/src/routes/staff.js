/**
 * Staff routes: GET (list with optional search), POST, PUT, DELETE.
 */
const express = require('express');
const router = express.Router();
const staffService = require('../services/staffService');

router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const staff = await staffService.listStaff(search);
    res.json(staff);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, photo_url } = req.body;
    const staff = await staffService.createStaff({ first_name, last_name, photo_url });
    res.status(201).json(staff);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { first_name, last_name, photo_url } = req.body;
    const staff = await staffService.updateStaff(req.params.id, { first_name, last_name, photo_url });
    res.json(staff);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
