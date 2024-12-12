#!/usr/bin/env node
import generate from './src/generate';
import { bundle, createConfig } from '@redocly/openapi-core';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -i [inputFile] -o [outputFile]')
  .option('i', {
    alias: 'input',
    describe: 'Input file',
    demandOption: true,
    type: 'string'
  })
  .option('o', {
    alias: 'output',
    describe: 'Output file',
    demandOption: true,
    type: 'string'
  })
  .help('help')
  .alias('help', 'h')
  .argv;


// @ts-expect-error i is a required arg
const inputFile = argv.i;
// @ts-expect-error o is a required arg
const outputFile = argv.o;

createConfig(
  {
    extends: ['minimal'],
    rules: {
      'operation-description': 'error',
    },

  }
).then(config => {
  bundle({ ref: inputFile, config, dereference: true }).then((res) => {
    generate(res.bundle.parsed, outputFile);

    // TODO: check for circular references
  }).catch(err => {
    console.error(`Bundling with \`redocly bundle\` failed. Check that path $refs to files are valid and try again.\n${err}`);
  });
});
