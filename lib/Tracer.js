'use strict';

const _ = require('lodash');
const uuid = require('uuid/v4');
const opentracing = require('opentracing');

const Span = require('./Span');

module.exports = class Tracer extends opentracing.Tracer {
  constructor(logger, config={}) {
    super();
    this._logger = logger;
    this.config = config;
  }

  _startSpan(name, opts={}) {
    const spanid = uuid();
    const traceid = _.size(opts.references) ? opts.references[0].referencedContext().toTraceId() : uuid();
    return new Span({
      name,
      id: spanid,
      trace: traceid,
      tracer: this,
      // TODO: baggage
      references: opts.references,
      tags: _.extend({}, this.config.tags, opts.tags),
      startTime: opts.startTime || Date.now(),
      logger: this._logger.child({span: spanid, trace: traceid})
    });
  }
}
