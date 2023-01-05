import type { HookContext, NextFunction } from '@feathersjs/feathers';
import _omit from 'lodash/omit.js';
import { checkContext } from '../utils/check-context';

/**
 * Delete certain fields from the query object.
 * @see https://hooks-common.feathersjs.com/hooks.html#discardquery
 */
export function discardQuery<H extends HookContext = HookContext>(...fieldNames: string[]) {
  return (context: H, next?: NextFunction) => {
    checkContext(context, 'before', null, 'discardQuery');

    const query = context.params.query || {};

    context.params.query = _omit(query, fieldNames);

    if (next) {
      return next();
    }

    return context;
  };
}
