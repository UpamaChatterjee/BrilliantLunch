const containerHeight = 720;
const containerWidth = 600;
const minutesinDay = 60 * 12;

const NO_MATCH = 'NO_MATCH'
const LEFT_BORDER = 'border-left-color'
const COLOR = 'color'
let collisions = [];
let width = [];
let leftOffSet = [];
let events = [];

// append one event to calendar
var createEvent = (height, top, left, units, id, matchedEventId) => {

  let node = document.createElement("DIV");
  node.className = "event";


  if (id === 0 && matchedEventId !== NO_MATCH) {
    node.style["border-left-color"] = "#30C20C"
    node.innerHTML =
      "<span class='title' style='color:#30C20C'> Me </span> "
  }
  if (id === 0 && matchedEventId === NO_MATCH) {
    node.style["border-left-color"] = "#000000"
    node.innerHTML =
      "<span class='title' style='color:#000000'> Me </span> "
  }
  else if (matchedEventId !== NO_MATCH && id === matchedEventId) {
    node.style["border-left-color"] = "#30C20C"
    node.innerHTML =
      "<span class='title' style='color:#30C20C'> Brilliant Lunch </span>";
  }
  else if (matchedEventId !== id && id !== 0) {
    node.style["border-left-color"] = "#0C2DC2"
    node.innerHTML =
      "<span class='title'> Brilliant Lunch </span>";
  }

  // Customized CSS to position each event
  node.style.width = (containerWidth / units) + "px";
  node.style.height = height + "px";
  node.style.top = top + "px";
  node.style.left = 100 + left + "px";

  document.getElementById("events").appendChild(node);
}





function calculateOverLapDuration(myStartTime, myEndTime, matchedEventIndex) {
  let matchedEventsDuration = []
  for (let ind = 0; ind < matchedEventIndex.length; ind++) {
    let index = matchedEventIndex[ind]
    if ((myStartTime > events[index].start) && (myEndTime > events[index].end)) {
      let obj = {
        eventId: matchedEventIndex[ind],
        duration: (events[index].end - myStartTime)
      }
      matchedEventsDuration.push(obj)
    }
    else if ((myStartTime < events[index].start) && (myEndTime < events[index].end)) {

      let obj = {
        eventId: matchedEventIndex[ind],
        duration: (myEndTime - events[index].start)
      }
      matchedEventsDuration.push(obj)

    }
    else if ((myStartTime == events[index].start) && (myEndTime == events[index].end)) {

      let obj = {
        eventId: matchedEventIndex[ind],
        duration: (myEndTime - myStartTime)
      }
      matchedEventsDuration.push(obj)

    }
    else if ((myStartTime > events[index].start) && (myEndTime < events[index].end)) {

      let obj = {
        eventId: matchedEventIndex[ind],
        duration: (myEndTime - myStartTime)
      }
      matchedEventsDuration.push(obj)
    }
  }

  return matchedEventsDuration
}


/* 
collisions is an array that tells you which events are in each 30 min slot
- each first level of array corresponds to a 30 minute slot on the calendar 
  - [[0 - 30mins], [ 30 - 60mins], ...]
- next level of array tells you which event is present and the horizontal order
  - [0,0,1,2] 
  ==> event 1 is not present, event 2 is not present, event 3 is at order 1, event 4 is at order 2
*/

function getCollisions(events) {

  //resets storage
  collisions = [];

  const myStartTime = events[0].start
  const myEndTime = events[0].end

  for (var i = 0; i < 24; i++) {
    var time = [];
    for (var j = 0; j < events.length; j++) {
      time.push(0);
    }
    collisions.push(time);
  }

  events.forEach((event, id) => {
    let end = event.end;
    let start = event.start;
    let order = 1;

    while (start < end) {
      timeIndex = Math.floor(start / 30);

      while (order < events.length) {
        if (collisions[timeIndex].indexOf(order) === -1) {
          break;
        }
        order++;
      }

      collisions[timeIndex][id] = order;
      start = start + 30;
    }

    collisions[Math.floor((end - 1) / 30)][id] = order;
  });

  // get array of overlapped event index 
  let matchedEventIndex = []
  collisions.forEach(eve => {
    if (eve[0] !== 0) {
      for (let i = 1; i < eve.length; i++) {
        if ((eve[i] !== 0) && (matchedEventIndex.indexOf(i) === -1)) {
          matchedEventIndex.push(i)
        }
      }
    }
  })

  if (matchedEventIndex.length > 0) {  
    if (matchedEventIndex.length === 1) { // if only one overlapped events found 

      let matchedEventsDuration = calculateOverLapDuration(myStartTime, myEndTime, matchedEventIndex)
      let maxDuration = matchedEventsDuration.sort((a, b) => b.duration - a.duration)[0].duration;

      // check if duration is more than 30 mins before returning event index
      return maxDuration > 30 ? matchedEventIndex[0] : NO_MATCH 
    }
    else if (matchedEventIndex.length > 1) { // if more than one overlapped events found

       // get duration for respective overlapped events
      let matchedEventsDuration = calculateOverLapDuration(myStartTime, myEndTime, matchedEventIndex)

      // find maximum overlapped duration
      let maxDuration = matchedEventsDuration.sort((a, b) => b.duration - a.duration)[0].duration;

      if (maxDuration > 30) {


        let sameDurationArr = []

        matchedEventsDuration.forEach(val => {
          if (val.duration === maxDuration) {
            sameDurationArr.push(val)
          }
        })

        let meetEarlyEventArr = []
 
        if (sameDurationArr.length > 1) {  // if more than one same maximum duration found find the events that meet early
          sameDurationArr.forEach(val => {
            if (myStartTime > events[val.eventId].start) {
              let obj = {
                eventId: val.eventId,
                earlyMeet: myStartTime - events[val.eventId].start
              }
              meetEarlyEventArr.push(obj)
            }
            else if (myStartTime < events[val.eventId].start) {
              let obj = {
                eventId: val.eventId,
                earlyMeet: events[val.eventId].start - myStartTime
              }
              meetEarlyEventArr.push(obj)
            }
          })

          let earlyMeetEvent = meetEarlyEventArr.sort((a, b) => a.earlyMeet - b.earlyMeet)[0];
          
          // return early meet 
          // incase of exact match , return first early meet 
          return earlyMeetEvent.eventId
        } else { // if only one event found with maximum duration 
          //return events[sameDurationArr[0].eventId]
          return sameDurationArr[0].eventId
        }
      }
      else { // if overlapped events durations are less than 30 mins 
        return NO_MATCH
      }
    }
  }
  else if (matchedEventIndex.length === 0) { // if not overlapped match found 
    return NO_MATCH
  }
};

/*
find width and horizontal position
 
width - number of units to divide container width by
horizontal position - pixel offset from left
*/
function getAttributes(events) {

  //resets storage
  width = [];
  leftOffSet = [];

  for (var i = 0; i < events.length; i++) {
    width.push(0);
    leftOffSet.push(0);
  }

  collisions.forEach((period) => {

    // number of events in that period
    let count = period.reduce((a, b) => {
      return b ? a + 1 : a;
    })

    if (count > 1) {
      period.forEach((event, id) => {
        // max number of events it is sharing a time period with determines width
        if (period[id]) {
          if (count > width[id]) {
            width[id] = count;
          }
        }

        if (period[id] && !leftOffSet[id]) {
          leftOffSet[id] = period[id];
        }
      })
    }
  });
};

var matchLunchEvent = (e) => {

  // clear any existing nodes
  events.length = 0
  events = [...e]
  if (events.length > 0) {
    var myNode = document.getElementById("events");
    myNode.innerHTML = '';

    // matchLunch(events);
    let matchedEventId = getCollisions(events);
    getAttributes(events);


    events.forEach((event, id) => {
      let height = (event.end - event.start) / minutesinDay * containerHeight;
      let top = event.start / minutesinDay * containerHeight;
      let end = event.end;
      let start = event.start;
      let units = width[id];
      if (!units) { units = 1 };
      let left = (containerWidth / width[id]) * (leftOffSet[id] - 1) + 10;
      if (!left || left < 0) { left = 10 };
      createEvent(height, top, left, units, id, matchedEventId);

    });
  } else if(events.length > 100) {
    alert('Maximum 100 events can be provided')
  }else {
    alert("Please provide more than one Events to calculate match")
  }
}