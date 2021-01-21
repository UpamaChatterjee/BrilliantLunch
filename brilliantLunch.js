//default events given
// let events = [];
// events = [{start: 225, end: 285},{start: 210,
// end: 270},{start: 180, end: 240},{start: 240, end:
// 300},{start: 300, end: 360},{start: 270, end: 330}];

matchLunchEvent([]);





//function to generate mock events for testing
function generateMockEvents (n) {
  let events = [];
  let minutesInDay = 60 * 12;

  while (n > 0) {
    let start = Math.floor(Math.random() * minutesInDay)
    let end = start + Math.floor(Math.random() * (minutesInDay - start));
    events.push({start: start, end: end})
    n --;
  }

  return events;
}
