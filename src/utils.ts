export function convertNumericObjectToArray(obj: Object) {
    // Ordina le chiavi numeriche e restituisce un array dei valori
    return Object.keys(obj)
      .sort((a, b) => Number(a) - Number(b)) // Ordina le chiavi come numeri
      //@ts-ignore
      .map(key => obj[key]);
  }
  