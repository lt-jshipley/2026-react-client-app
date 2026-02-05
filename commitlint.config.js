export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Code style (formatting)
        'refactor', // Code refactoring
        'perf', // Performance
        'test', // Tests
        'chore', // Build, dependencies
        'ci', // CI/CD
        'revert', // Revert commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
}
