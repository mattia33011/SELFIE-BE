export function convertNumericObjectToArray(obj: Object) {
  // Ordina le chiavi numeriche e restituisce un array dei valori
  return (
    Object.keys(obj)
      .sort((a, b) => Number(a) - Number(b)) // Ordina le chiavi come numeri
      //@ts-ignore
      .map((key) => obj[key])
  );
}

export function generateGoogleMapLink(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${location.replace(
    " ",
    "+"
  )}`;
}

export function compareDatesByDay(date1: Date, date2: Date) {
  return (
    date1.getDate() == date2.getDate() &&
    date1.getMonth() == date2.getMonth() &&
    date1.getFullYear() == date2.getFullYear()
  );
}

export function dateIsAfterOtherDate(date1: Date, date2: Date) {
  if (date1.getFullYear() > date2.getFullYear()) return true;
  if (date1.getMonth() > date2.getMonth()) return true;
  return date1.getDate() >= date2.getDate();
}

export function dateIsBeforeOtherDate(date1: Date, date2: Date) {
  if (date1.getFullYear() < date2.getFullYear()) return true;
  if (date1.getMonth() < date2.getMonth()) return true;
  return date1.getDate() <= date2.getDate();
}

export function dateIsBetweenOtherDates(date1: Date, date2: Date, date3: Date) {
  return (
    dateIsBeforeOtherDate(date1, date2) && dateIsAfterOtherDate(date1, date3)
  );
}
