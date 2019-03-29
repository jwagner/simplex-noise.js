
module.exports = api => {
	api.cache(true)
	return {
		plugins: [
			"transform-commonjs"
		],
		ignore: [
			"perf",
			"test",
			"dist-esm",
			".eslintrc.js",
			"node_modules"
		]
	}
}
