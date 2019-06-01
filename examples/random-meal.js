'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');
const Tracer = require('../lib/Tracer');

const DRINKS = ['water', 'lemonade', 'tea', 'coke', 'beer', 'wine'];
const ENTREES = ['spaghetti', 'grilled chicken', 'hamburger', 'macaroni', 'ramen', 'pizza'];
const DESSERTS = ['icecream', 'chocolate cake', 'cheesecake', 'cookie'];

const logger = bunyan.createLogger({name: 'random-meal', level: 'DEBUG'});
const tracer = new Tracer(logger, {captureErrorStack: true});

function invoke(name, fn, parent) {
  const span = tracer.startSpan(name, {childOf: parent});
  try {
    return fn(span);
  }
  catch(err) {
    span.log({error: err});
    span.setTag('error', true);
    throw err;
  }
  finally{
    span.finish();
  }
}
function randomThrow() {
  const THRESHOLD = 2;
  const rand = _.random(1, 10);
  if(rand <= 2) throw new Error(`Random error die rolled "${rand}"`);
}

function planMeal(span) {
  const drink = invoke('drink', pickDrink, span);
  const entree = invoke('entree', pickEntree, span);
  const dessert = invoke('dessert', pickDessert, span);

  return {drink, entree, dessert};
}
function pickDrink(span) {
  randomThrow();
  return _.sample(DRINKS);
}
function pickEntree(span) {
  randomThrow();
  return _.sample(ENTREES);
}
function pickDessert(span) {
  randomThrow();
  return _.sample(DESSERTS);
}


setInterval(() => {
  try {
    const result = invoke('meal', planMeal);
    logger.debug(`I'll have ${result.entree} with ${result.drink} and ${result.dessert} for dessert`);
  }
  catch(err) {
    logger.error(err, `Hmmm, something went wrong`);
  }
}, 1000);
