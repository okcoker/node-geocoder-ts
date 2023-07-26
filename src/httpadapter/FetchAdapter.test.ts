import FetchAdapter from './FetchAdapter';

describe('FetchAdapter', () => {
  test('filters undefined values', async () => {
    const spy = jest.fn();
    const adapter = new FetchAdapter({
      fetch: spy
    });
    const url = 'https://google.com';
    await adapter.get(url, {
      one: 1,
      two: 2,
      three: undefined,
      four: undefined,
      five: 5
    }).catch(() => {
      // Doesnt matter
    });

    expect(spy.mock.calls[0][0]).toEqual(`${url}?one=1&two=2&five=5`);
  });
})
