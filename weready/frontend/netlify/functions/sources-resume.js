'use strict';

const { createSourceCommandHandler } = require('./_shared/source-actions');

exports.handler = createSourceCommandHandler({
  name: 'sources-resume',
  backendPathBuilder: (sourceId) => `/api/sources/${encodeURIComponent(sourceId)}/resume`,
});
