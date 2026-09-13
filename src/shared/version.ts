/**
 * Schema and build identifiers for save compatibility.
 *
 * SCHEMA_VERSION tracks the persisted save-bundle *data shape*. M02 adds an
 * optional `citizens[]` array (needs, assignments, active action, utility
 * trace) under schema `m02.1`. The M00 golden-digest regression test still
 * pins the literal `m00.1` without citizens so its lock is historical and
 * independent of this constant.
 */
export const SCHEMA_VERSION = 'm02.1';
export const BUILD_VERSION = '0.0.1-m02';
export const MILESTONE = 'M02';
