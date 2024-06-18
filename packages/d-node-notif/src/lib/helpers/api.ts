import Constants from '../constants';

export function getQueryParams(obj: any) {
    return Object.keys(obj)
      .map(key => {
        return `${key}=${encodeURIComponent(obj[key])}`;
      })
      .join('&');
}

export function getLimit(passedLimit?: number) {
    if (!passedLimit) return Constants.PAGINATION.LIMIT;
  
    // if (passedLimit > Constants.PAGINATION.LIMIT_MAX) {
    //   return Constants.PAGINATION.LIMIT_MAX;
    // }
  
    return passedLimit;
}