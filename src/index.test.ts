import {describe, expect, test} from '@jest/globals';
import { echo } from './index';

test('echo echo to be echo', () => {
  expect(echo('echo')).toBe('echo');
});