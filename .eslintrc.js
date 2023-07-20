module.exports = {
    'env': {
        'es6': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 2019,
        'sourceType': 'module'
    },
    'plugins': [
        '@typescript-eslint',
        'prettier'
    ],
    'rules': {
        // Remove this once we convert all the anys
        '@typescript-eslint/no-explicit-any': 'warn',

        // From original package.json lint rules
        'strict': 0,
        'quotes': [
            1,
            'single'
        ],
        'no-console': 1,
        'camelcase': 0,
        'no-underscore-dangle': 0,
        'no-shadow': 0,
        'no-multi-spaces': 0,
        'eqeqeq': 0,
        'key-spacing': 0,
        'comma-spacing': 0,
        'no-unreachable': 1
    }
};
