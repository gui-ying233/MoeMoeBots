// eslint-disable-next-line no-undef
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['./src', './__tests__'],
	transform: { '\\.ts$': ['ts-jest'] },
	testRegex: '(/__tests__/.*|(\\.|/))\\.ts$',
	moduleFileExtensions: ['ts', 'js', 'json'],
	globals: {
		'ts-jest': {
			tsconfig: {
				// allow js in typescript
				allowJs: true,
			},
		},
	},
};
