const Helper = {
  isString(testVar: any) {
    return typeof testVar === 'string' || testVar instanceof String;
  }
};

export default Helper;
