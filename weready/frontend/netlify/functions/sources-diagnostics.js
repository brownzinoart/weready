'use strict';

const { createSourceCommandHandler } = require('./_shared/source-actions');

exports.handler = createSourceCommandHandler({
  name: 'sources-diagnostics',
  backendPathBuilder: (sourceId) => `/api/sources/${encodeURIComponent(sourceId)}/diagnostics`,
});
