import { AbstractGeocoderAdapter, NodeCallback } from 'types';

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

  adapterSpy.mockImplementation((url: string, params: Record<string, any>, callback: NodeCallback<any>) => {
    if (mockError) {
      callback(mockError, null);
    }
    else {
      callback(null, mockResponse)
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
