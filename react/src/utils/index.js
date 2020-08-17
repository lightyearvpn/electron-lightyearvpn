function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function round2Decimal(number) {
  return Math.round(number*100)/100
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

export {
  capitalize,
  round2Decimal,
  isEmptyObject
}
