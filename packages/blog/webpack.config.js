const path = require('path');
const webpack = require('webpack');

const webpackPath = path.resolve(__dirname, 'dist/webpack');
const releasePath = path.resolve(__dirname, 'dist/release');

/**
 * @readonly
 * @desc Webpack/Custom Command Line Interface
 */
class CustomDefaultConfig {
    static noop() {
        // nonchalance
    }

    static get argv() {
        return {
            mode: 'production',
            devtool: false,
        };
    }

    static get env() {
        return {
            // Custom environment variables
        };
    }

    constructor(envProxy, argvProxy) {
        this.envProxy = envProxy;
        this.argvProxy = argvProxy;
        this.lastCompiled = new Date().toISOString();
    }

    get production() {
        return this.argvProxy.mode === 'production';
    }

    get outputPath() {
        return this.production ? releasePath : webpackPath;
    }
}

/**
 * @desc Webpack Config
 */
module.exports = function (_env = {}, _argv = {}) {
    const env = new Proxy(CustomDefaultConfig.env, {
        get(target, key, receiver) {
            if (_env[key] != null) return _env[key];
            return Reflect.get(target, key, receiver);
        },
    });
    const argv = new Proxy(CustomDefaultConfig.argv, {
        get(target, key, receiver) {
            if (_argv[key] != null) return _argv[key];
            return Reflect.get(target, key, receiver);
        },
    });
    const config = new CustomDefaultConfig(env, argv);

    return {
        mode: argv.mode,
        entry: {
            blog: './index.ts',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                projectReferences: true,
                                compilerOptions: {
                                    module: 'esnext',
                                },
                            },
                        },
                    ],
                },
            ],
        },
        output: {
            path: config.outputPath,
            filename: '[name].js',
            libraryTarget: 'umd',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
        },
        node: false,
    };
};
