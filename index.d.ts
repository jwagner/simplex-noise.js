// Type definitions for simplex-noise 2.3.0
declare module 'simplex-noise'
{
	export = SimplexNoise;

	/** Deterministic simplex noise generator suitable for 2D, 3D and 4D spaces. */
	class SimplexNoise
	{
		/**
		 * Creates a new `SimplexNoise` instance. You want to use this sparingly, as it is a relatively
		 * expensive.
		 * @param {SimplexNoise.RandomNumberGenerator | string} [random=Math.random] - The random number
		 *     generator to use. This argument could e.g. be used to inject a seeded generator.
		 */
		constructor(random?: SimplexNoise.RandomNumberGenerator | string);

		/**
		 * Calculates the noise value in the range [-1;1] for the given point in a 2D space.
		 * @param {number} x
		 * @param {number} y
		 * @return {number}
		 */
		noise2D(x: number, y: number): number;

		/**
		 * Calculates the noise value in the range [-1;1] for the given point in a 3D space.
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @return {number}
		 */
		noise3D(x: number, y: number, z: number): number;

		/**
		 * Calculates the noise value in the range [-1;1] for the given point in a 4D space.
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @param {number} w
		 * @return {number}
		 */
		noise4D(x: number, y: number, z: number, w: number): number;
	}

	namespace SimplexNoise
	{
		export type RandomNumberGenerator = {(): number};
	}
}
