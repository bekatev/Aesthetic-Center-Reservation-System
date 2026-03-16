/**
 * Reservation routes: get by date, create (with overlap check), update, delete.
 */
const express = require('express');
const router = express.Router();
const reservationsService = require('../services/reservationsService');

router.get('/', async (req, res, next) => {
  try {
    const { date } = req.query;
    const reservations = await reservationsService.getDailySchedule(date);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const reservation = await reservationsService.createReservationWithChecks(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const reservation = await reservationsService.updateReservationWithChecks(req.params.id, req.body);
    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await reservationsService.deleteReservation(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
