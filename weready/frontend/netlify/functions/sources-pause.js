'use strict';

const { createSourceCommandHandler } = require('./_shared/source-actions');

exports.handler = createSourceCommandHandler({
  name: 'sources-pause',
  backendPathBuilder: (sourceId) => `/api/sources/${encodeURIComponent(sourceId)}/pause`,
});
