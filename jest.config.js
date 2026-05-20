module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup\\.ts$'],
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|zustand|@shopify/react-native-skia|expo-background-task|expo-audio)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'utils/**/*.ts',
    'store/**/*.ts',
    'services/**/*.ts',
    'hooks/**/*.ts',
    'constants/**/*.ts',
    'storage/**/*.ts',
    '!**/*.d.ts',
  ],
};
