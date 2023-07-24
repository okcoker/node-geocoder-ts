import TokenCache from 'lib/utils/TokenCache';

describe('TokenCache', () => {
  test('Should return cached token', async () => {
    const cache = new TokenCache();
    const token = 'sometoken';

    cache.put(token, Date.now() * 2);

    expect(cache.get()).toEqual(token);
    // Make sure we get the same token twice (following old test)
    expect(cache.get()).toEqual(token);
  });

  test('Should assume cached token is invalid', () => {
    const cache = new TokenCache();
    const token = 'sometoken';

    cache.put(token, -2000);

    //Verify token is old
    expect(cache.get()).toEqual(null);
  });
});
