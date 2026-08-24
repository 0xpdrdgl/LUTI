import { makeRouteHandler } from '@keystatic/astro/api';
import keystaticConfig from '../../keystatic.config';

export const prerender = false;

export const GET = makeRouteHandler({ config: keystaticConfig });
export const POST = makeRouteHandler({ config: keystaticConfig });
export const PUT = makeRouteHandler({ config: keystaticConfig });
export const DELETE = makeRouteHandler({ config: keystaticConfig });
export const PATCH = makeRouteHandler({ config: keystaticConfig });