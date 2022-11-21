import {describe, expect, test} from '@jest/globals';
import { AsapTokenizer } from './asap-tokenizer';


let asapMathTokenizer: AsapTokenizer<string> = null!; 
beforeAll(() => {
  asapMathTokenizer = buildMathTokenizer();
});

test('expect 1 + 1 to be correct', () => {
  expect( asapMathTokenizer.tokenize('1 + 1').join('') )
    .toEqual( [IntegerToken('1'), PLUS_TOKEN, IntegerToken('1')].join('') )
});

test('expect 1+1 to be equal to 1 + 1', () => {
  expect( asapMathTokenizer.tokenize('1+1').join('') )
    .toEqual( asapMathTokenizer.tokenize('1 + 1').join('') )
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

test('expect 1 * 1 to be correct', () => {
  expect(asapMathTokenizer.tokenize('1 * 1'))
    .toEqual([IntegerToken('1'), TIMES_TOKEN, IntegerToken('1')])
});

test('expect 1 ^ 1 to be correct', () => {
  expect(asapMathTokenizer.tokenize('1 ^ 1'))
    .toEqual([IntegerToken('1'), POW_TOKEN, IntegerToken('1')])
});

test('expect 1 ** 1 to be equal to 1 ^ 1', () => {
  expect(asapMathTokenizer.tokenize('1 ** 1'))
    .toEqual(asapMathTokenizer.tokenize('1 ^ 1'));
});

test('expect huge parsing to be correct', () => {
  const input = '1 + 1 - 1 * 1 / 1 ^ ( 1 + 1.25 ) +'.repeat(Math.pow(10, 3));
  const intToken = IntegerToken('1');

  expect(asapMathTokenizer.tokenize(input).join(''))
    .toEqual([
      intToken, PLUS_TOKEN, intToken, MINUS_TOKEN, intToken, TIMES_TOKEN,
      intToken, DIVIDE_TOKEN, intToken, POW_TOKEN, LDelimToken('('), intToken,
      PLUS_TOKEN, FractionalToken('1.25'), RDelimToken(')'), PLUS_TOKEN
    ].join('').repeat(Math.pow(10, 3)));
});

const PLUS_TOKEN = 'PlusToken';
const MINUS_TOKEN = 'MinusToken';
const TIMES_TOKEN = 'TimesToken';
const DIVIDE_TOKEN = 'DivideToken';
const POW_TOKEN = 'PowToken';

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

function buildMathTokenizer() {
  return new AsapTokenizer<string>()
    .addState(states.initial, (mutator) => { throw new Error(`Unexpected token ${mutator.reader()}`) })
      .from(states.initial).with(' ') 
    .addState(states.integer, (mutator) => { mutator.pusher(IntegerToken(mutator.reader())) } )
      .from(states.initial).with('0123456789')
      .from(states.integer).with('0123456789')
    .addState(states.plus, (mutator) => { mutator.pusher(PLUS_TOKEN) })
      .from(states.initial).with('+')
    .addState(states.minus, (mutator) => { mutator.pusher(MINUS_TOKEN) })
      .from(states.initial).with('-')
    .addState(states.times, (mutator) => { mutator.pusher(TIMES_TOKEN) })
      .from(states.initial).with('*')
    .addState(states.divide, (mutator) => { mutator.pusher(DIVIDE_TOKEN) })
      .from(states.initial).with('/')
    .addState(states.pow, (mutator) => { mutator.pusher(POW_TOKEN) })
      .from(states.initial).with('^')
      .from(states.times).with('*')
    .addState(states.lDelim, (mutator) => { mutator.pusher(LDelimToken(mutator.reader())) })
      .from(states.initial).with('([{')
    .addState(states.rDelim, (mutator) => { mutator.pusher(RDelimToken(mutator.reader())) })
      .from(states.initial).with('}])')
    .addState(states.fractional, (mutator) => { mutator.pusher(FractionalToken(mutator.reader())) })
      .from(states.integer).with(',.')
      .from(states.fractional).with('0123456789')
    .getTokenizer();
}
