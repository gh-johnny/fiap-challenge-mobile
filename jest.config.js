module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|zustand)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'utils/**/*.ts',
    'store/**/*.ts',
    'services/**/*.ts',
    'hooks/**/*.ts',
    '!**/*.d.ts',
  ],
};
