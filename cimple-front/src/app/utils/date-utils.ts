export class DateUtils {
  public static convertDateFields(body: any) {
    if (body === null || body === undefined) {
      return body;
    }

    if (typeof body !== 'object') {
      return body;
    }

    for (const key of Object.keys(body)) {
      const value = body[key];
      if (DateUtils.isIso8601(value)) {
        body[key] = new Date(value);
      } else if (typeof value === 'object') {
        DateUtils.convertDateFields(value);
      }
    }
    return body
  }


  private static isIso8601(value: string) {
    if (value === null || value === undefined) {
      return false;
    }
    const iso8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z|[+-]\d{4})?$/;
    return iso8601.test(value);
  }
}
