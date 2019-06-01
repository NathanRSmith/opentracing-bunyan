'use strict';

module.exports = class SpanContext {
  constructor(span) {
    this._span = span;
  }

  toSpanId() {
    return this._span._id;
  }
  toTraceId() {
    return this._span._trace;
  }
}
