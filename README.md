# **A**s **S**imple **A**s **P**ossible - Tokenizer
A simple library to write simple tokenizers in a simple way.

It should also be fast, except if you compare it to a switch-case hardcoded tokenizer, nothing is faster than a switch-case hardcoded tokenizer.

## Examples
Here's a tokenizer for simple math expressions, you can use any type you want for your tokens, we're going to use simple strings.

```typescript
// Define tokens
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

// Define states
const states = {
  initial: 0, // the 0 state is required, it will be the initial one
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

// Build the tokenizer
function buildMathTokenizer() {
  // the type for the tokens is given as a type argument for AsapTokenizer
  return new AsapTokenizer<string>()
    // a state is a function inoked when no transition is available.
    // the argument provided to the function has two properties
    // - reader: a function you can invoke to read the accumulated string in your state
    // - pusher: a function you can invoke to push a token to the results
    // navigating from initial to initial will discard the char (this is not true for the other states.)
    .addState(states.initial, (mutator) => { throw new Error(`Unexpected token ${mutator.reader()}`) })
      // you can navigate to the state you just added 
      // - from: another state
      // - with: a given input
      .from(states.initial).with(' ')
    .addState(states.integer, (mutator) => { mutator.pusher(IntegerToken(mutator.reader())) } )
      .from(states.initial).with('0123456789') // navigate to integer state from initial state with any digit
      .from(states.integer).with('0123456789') // navigate to integer state from integer state with any digit 
    .addState(states.plus, (mutator) => { mutator.pusher(PLUS_TOKEN) })
      .from(states.initial).with('+')
    .addState(states.minus, (mutator) => { mutator.pusher(MINUS_TOKEN) })
      .from(states.initial).with('-')
    .addState(states.times, (mutator) => { mutator.pusher(TIMES_TOKEN) })
      .from(states.initial).with('*')
    .addState(states.divide, (mutator) => { mutator.pusher(DIVIDE_TOKEN) })
      .from(states.initial).with('/')
    .addState(states.pow, (mutator) => { mutator.pusher(POW_TOKEN) })
      .from(states.initial).with('^') // ^ will emit a POW_TOKEN
      .from(states.times).with('*')   // if we're in times state then * will emit a POW_TOKEN (allows for ** to be tokenized like ^)
    .addState(states.lDelim, (mutator) => { mutator.pusher(LDelimToken(mutator.reader())) })
      .from(states.initial).with('([{')
    .addState(states.rDelim, (mutator) => { mutator.pusher(RDelimToken(mutator.reader())) })
      .from(states.initial).with('}])')
    .addState(states.fractional, (mutator) => { mutator.pusher(FractionalToken(mutator.reader())) })
      .from(states.integer).with(',.')
      .from(states.fractional).with('0123456789')
    .getTokenizer();
}

```
