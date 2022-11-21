import {describe, expect, test} from '@jest/globals';
import { AsapTokenizer, TokenMutator } from './asap-tokenizer';
const states = {
  initial: 0,
  integer: 1,
  plus: 2,
  minus: 3,
  times: 4,
  divide: 5,
  pow: 6,
  lDelim: 7,
  rDelim: 8,
  fractional: 9
};

let asapMathTokenizer: AsapTokenizer<string> = null!; 

const PLUS_TOKEN = 'PlusToken';
const MINUS_TOKEN = 'MinusToken';

const TIMES_TOKEN = 'TimesToken';
const DIVIDE_TOKEN = 'DivideToken';
const POW_TOKEN = 'PowToken';
beforeAll(() => {
  asapMathTokenizer = new AsapTokenizer<string>()
    .addState(states.initial, (mutator) => { throw new Error(`Unexpected token ${mutator.reader()}`) })
      .addTransition(' ', states.initial, states.initial)
    .addState(states.integer, (mutator) => { mutator.pusher(IntegerToken(mutator.reader())) } )
      .addTransition('0123456789', states.initial, states.integer)
      .addTransition('0123456789', states.integer, states.integer)
    .addState(states.plus, (mutator) => { mutator.pusher(PLUS_TOKEN) })
      .addTransition('+', states.initial, states.plus) 
    .addState(states.minus, (mutator) => { mutator.pusher(MINUS_TOKEN) })
      .addTransition('-', states.initial, states.minus)
    .addState(states.times, (mutator) => { mutator.pusher(TIMES_TOKEN) })
      .addTransition('*', states.initial, states.times)
    .addState(states.divide, (mutator) => { mutator.pusher(DIVIDE_TOKEN) })
      .addTransition('/', states.initial, states.divide)
    .addState(states.pow, (mutator) => { mutator.pusher(POW_TOKEN) })
      .addTransition('^', states.initial, states.pow)
    .addState(states.lDelim, (mutator) => { mutator.pusher(LDelimToken(mutator.reader())) })
      .addTransition('([{', states.initial, states.lDelim)
    .addState(states.rDelim, (mutator) => { mutator.pusher(RDelimToken(mutator.reader())) })
      .addTransition('}])', states.initial, states.rDelim)
    .addState(states.fractional, (mutator) => { mutator.pusher(FractionalToken(mutator.reader())) })
      .addTransition(',.', states.integer, states.fractional)
      .addTransition('0123456789', states.fractional, states.fractional);
});

test('expect 1 + 1 to be correct', () => {
  expect( asapMathTokenizer.tokenize('1 + 1').join('') )
    .toEqual( [IntegerToken('1'), PLUS_TOKEN, IntegerToken('1')].join('') )
});

test('expect 1 - 1 to be correct', () => {
  expect( asapMathTokenizer.tokenize('1 - 1').join('') )
    .toEqual( [IntegerToken('1'), MINUS_TOKEN, IntegerToken('1')].join('') )
});

test('expect 1.1 to be correct', () => {
  expect( asapMathTokenizer.tokenize('1.1').join('') )
    .toBe(FractionalToken('1.1'));
});

test('expect 1 . 1 to throw', () => {
  expect( () => asapMathTokenizer.tokenize('1 . 1').join('') )
    .toThrow();
});

function FractionalToken(value: string): string {
  return `FractionalToken(${value})`;
}

function LDelimToken(value: string): string {
  return `LDelimToken(${value})`;
}

function RDelimToken(value: string): string {
  return `RDelimToken(${value})`;
}

function IntegerToken(value: string): string {
  return `IntegerToken(${value})`;
}
