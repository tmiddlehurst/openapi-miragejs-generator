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


const inputFile = argv.i;
const outputFile = argv.o;

createConfig(
  {
    extends: ['minimal'],
    rules: {
      'operation-description': 'error',
    },
  }
).then(config => {
  bundle({ ref: inputFile, config },).then((res) => {
    try {
      generate(res.bundle.parsed, outputFile);
    } catch (e) {
    }
  }).catch(err => {
    console.error(`Bundling with \`redocly bundle\` failed. Check that path $refs to files are valid and try again.\n${err}`);
  });
});
