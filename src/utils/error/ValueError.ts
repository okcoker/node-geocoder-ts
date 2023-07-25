class ValueError extends Error {
  constructor(message: string) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.name = 'ValueError';
    this.message = message;
  }
}

export default ValueError;
