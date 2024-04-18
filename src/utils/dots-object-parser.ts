interface DotNotationObject {
  [key: string]: number | DotNotationObject | any;
}

export function parseDotObject(dotObj: DotNotationObject): any {
  const result: any = {};

  for (const key in dotObj) {
    const value = dotObj[key];

    const keys = key.split('.');

    let currentObj = result;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        // Last key, assign the value
        currentObj[k] = value;
      } else {
        // Create nested object if not exists
        currentObj[k] = currentObj[k] || {};
        currentObj = currentObj[k];
      }
    }
  }

  return result;
}
