module.exports = {
  // ...otras configuraciones de Jest...

  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/config/jest/fileMock.js',
  },

};
