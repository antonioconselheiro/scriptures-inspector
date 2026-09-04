import { demassoretifierFn } from './demassoretifier-fn';

describe('demassoretifierFn', () => {

  it('should demassoretify text', () => {
    const textDemassoretified = demassoretifierFn("לְמִינֵ֔הוּ");
    expect(textDemassoretified).toBe('למינהו');
  });

});