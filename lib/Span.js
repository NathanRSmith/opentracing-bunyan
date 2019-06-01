'use strict';

const _ = require('lodash');
const opentracing = require('opentracing');

const SpanContext = require('./SpanContext');

const ARGS = ['name', 'id', 'trace', 'tracer', 'references', 'tags', 'startTime', 'logger'];
module.exports = class Span extends opentracing.Span {

  constructor(args={}) {
    super();
    _.defaults(args, {references: [], tags: {}, startTime: Date.now()});
    _.each(_.pick(args, ARGS), (v, k) => this['_'+k] = v);
    this._finishTime;

    this._logger.info({span_evt: 'start', span_name: this._name})
  }

  _addTags(tags={}) {
    this._tags = _.extend(this._tags, tags);
  }

  _context() {
    return new SpanContext(this);
  }

  _finish(timestamp) {
    this._finishTime = timestamp || Date.now();
    this._logger.info({
      span_evt: 'finish',
      span_name: this._name,
      references: _.map(this._references, v => ({type: v.type(), span: v.referencedContext().toSpanId()})),
      tags: this._tags,
      // baggage
      time_start: this._startTime,
      time_finish: this._finishTime,
      duration: this._finishTime - this._startTime
    })
  }

  // _getBaggageItem

  _log(keyValuePairs={}) {
    debugger
    // TODO: make stack capture configurable
    if(_.isError(keyValuePairs.error)) {
      const stack = keyValuePairs.error.stack;
      keyValuePairs.error = keyValuePairs.error.toJSON ? keyValuePairs.error.toJSON() : _.pick(keyValuePairs.error, 'name', 'message');
      if(this._tracer.config.captureErrorStack) keyValuePairs.error.stack = stack;
    }

    this._logger.debug(_.extend({span_evt: 'log'}, keyValuePairs));
  }

  // _setBaggageItem
  // _setOperationName
  _tracer() {
    return this._tracer;
  }

}
