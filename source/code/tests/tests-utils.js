/**
 * Returns a function that ensures a promise is not rejected; and completes the test.
 * Validation process must not be rejected, because Promise should only be rejected in exceptional situations,
 * following the specification.
 * Ref. https://www.w3.org/2001/tag/doc/promises-guide#rejections-should-be-exceptional
 * 
 * @param {*} always 
 */
function noReject(always) {
  return function (error) {
    console.error(error)
    expect(0).toEqual(1, "Validation process must not be rejected")
    always()
  }
}

function wait(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, ms || 0);
  });
}

export { noReject, wait }