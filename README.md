# tsconfig-inspect

`tsconfig-inspect` is a CLI tool designed to provide an enhanced view of the TypeScript configuration options, offering
deeper insights than the standard `--showConfig` parameter. It allows users to inspect the tsconfig file more
thoroughly, including defaults and resolved files.

## Features

- **Custom Path Specification**: Specify the path to your tsconfig file.
- **View Default Options**: Choose whether to display unchanged default options.
- **Resolve Included Files**: Option to display files resolved by the tsconfig.

## Installation

Before you can use `tsconfig-inspect`, make sure you have Node.js installed on your machine. You can then install the
tool via npm or yarn:

```bash
npm install -g tsconfig-inspect
# or
yarn global add tsconfig-inspect
```

## Usage

To use `tsconfig-inspect`, run the following command in your terminal:

```bash
tsconfig-inspect [options]
```

### Options

- `--path <value>`: The path to the tsconfig file to inspect. Defaults to `./tsconfig.json`.
- `--defaults <value>`: Enable or disable showing unchanged default settings (`true/false`). Default is `true`.
- `--showFiles <value>`: Enable or disable showing resolved included files (`true/false`). Default is `true`.

### Examples

**Inspect a Specific tsconfig File**

```bash
tsconfig-inspect --path /path/to/your/tsconfig.json
```

**Hide Default Options**

```bash
tsconfig-inspect --defaults false
```

**Disable Resolved Files Display**

```bash
tsconfig-inspect --showFiles false
```

## Contributing

Contributions are always welcome! Please read the [contributing guidelines](./CONTRIBUTING.md) before starting.

## License

`tsconfig-inspect` is released under the [MIT License](./LICENSE).
