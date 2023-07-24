import { Nullable } from 'types';

interface Cache {
  now(): number;
  put(token: string, expiration: number): void;
  get(): Nullable<string>;
}

class TokenCache implements Cache {
  private token: Nullable<string> = null;
  private expiration = 0;

  /**
   *
   * @returns unix timestamp in milliseconds
   */
  now(): number {
    return new Date().getTime();
  }

  /**
   *
   * @param token token to cache
   * @param expiration additional milliseconds added onto the current time
   */
  put(token: string, expiration: number) {
    this.token = token;
    //Shave 30 secs off expiration to ensure that we expire slightly before the actual expiration
    this.expiration = this.now() + (expiration - 30);
  }

  /**
   *
   * @returns current token if not expired
   */
  get(): Nullable<string> {
    if (this.now() <= this.expiration) {
      return this.token;
    }

    return null;
  }
}

export default TokenCache;
export type { Cache };
