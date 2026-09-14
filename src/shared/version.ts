/**
 * Schema and build identifiers for save compatibility.
 *
 * SCHEMA_VERSION tracks the persisted save-bundle *data shape*. M02 extends the
 * snapshot with an optional `citizens` array, so the schema advances to `m02.0`.
 * The M00 golden-digest regression test pins the literal `m00.1` so its lock is
 * historical and independent of this constant.
 */
export const SCHEMA_VERSION = 'm02.0';
export const BUILD_VERSION = '0.0.1-m02';
export const MILESTONE = 'M02';
