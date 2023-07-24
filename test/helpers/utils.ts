import { AbstractGeocoderAdapter } from 'types';

export async function verifyHttpAdapter<T>({
  adapter,
  work,
  callCount = 1,
  expectedUrl,
  expectedParams,
  mockResponse,
  mockError
}: {
  adapter: AbstractGeocoderAdapter<any>,
  work: () => Promise<T>,
  callCount?: number,
  expectedUrl?: string,
  expectedParams?: any,
  mockResponse?: any,
  mockError?: any,
}): Promise<T> {
  const adapterSpy = jest.spyOn(adapter.httpAdapter, 'get');

  adapterSpy.mockImplementation((_url: string, _params: Record<string, any>, _fullResponse = false) => {
    if (mockError) {
      return Promise.reject(mockError);
    }

    try {
      // Fetch adapter will attempt to do parsing by default
      return JSON.parse(mockResponse);
    }
    catch {
      return Promise.resolve(mockResponse)
    }
  })

  const results = await work();

  expect(adapterSpy).toHaveBeenCalledTimes(callCount);

  if (typeof expectedUrl !== 'undefined') {
    expect(adapterSpy.mock.calls[0][0]).toEqual(expectedUrl)
  }

  if (typeof expectedParams !== 'undefined') {
    expect(adapterSpy.mock.calls[0][1]).toEqual(expectedParams);
  }

  return results;
}
