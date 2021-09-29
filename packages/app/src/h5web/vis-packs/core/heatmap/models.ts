import type { INTERPOLATORS } from '@h5web/lib';

export type ColorMap = keyof typeof INTERPOLATORS;

export type Layout = 'contain' | 'cover' | 'fill';
