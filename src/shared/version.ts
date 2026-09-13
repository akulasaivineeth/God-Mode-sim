/**
 * Schema and build identifiers for save compatibility.
 *
 * SCHEMA_VERSION tracks the persisted save-bundle *data shape*. M01 did not
 * change the persisted shape (time is derived; the town is authored content), so
 * the schema stays `m00.1`. Only the build/milestone identifiers advance. The
 * M00 golden-digest regression test pins the literal `m00.1` so its lock is
 * historical and independent of this constant.
 */
export const SCHEMA_VERSION = 'm02.1';
export const BUILD_VERSION = '0.0.1-m02';
export const MILESTONE = 'M02';
