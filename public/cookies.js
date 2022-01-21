/*
https://stackoverflow.com/a/24103596
*/
/**
 * Set a cookie with a value and an expiration date.
 * @param {String} name - The name of the cookie.
 * @param {String} value - The value of the cookie.
 * @param {Integer} days - The number of days until the cookie expires.
 * @returns None
 */
export function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
/**
 * Given a cookie name, return the value of the cookie.
 * @param {String} name - The name of the cookie to retrieve.
 * @returns The value of the cookie.
 */
export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
/**
 * Erase a cookie by setting its expiration date to 1970-01-01T00:00:01Z.
 * @param name - The name of the cookie.
 * @returns None
 */
export function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
