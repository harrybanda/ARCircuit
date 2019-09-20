const Diagnostics = require("Diagnostics");
const Scene = require("Scene");
const Patches = require("Patches");
const Materials = require("Materials");

// circuit components
const bulb1Object = Scene.root.find("Bulb1");
const bulb2Object = Scene.root.find("Bulb2");
const switchObject = Scene.root.find("Switch");
const batteryObject = Scene.root.find("Battery");
const glassObject = Scene.root.find("Glass");
const copperObject = Scene.root.find("Copper");
const bulb1Head = Scene.root.find("Head1");
const bulb2Head = Scene.root.find("Head2");

const positions = {
  bulb1Pos: bulb1Object.transform.position,
  bulb2Pos: bulb2Object.transform.position,
  switchPos: switchObject.transform.position,
  battPos: batteryObject.transform.position,
  glassPos: glassObject.transform.position,
  copperPos: copperObject.transform.position
};

// circuit slots
const slot1Object = Scene.root.find("Slot1");
const slot2Object = Scene.root.find("Slot2");
const slot3Object = Scene.root.find("Slot3");
const slot4Object = Scene.root.find("Slot4");

// component tapped boolean signals
const isTappedBulb1 = Patches.getBooleanValue("bulb_1_tapped");
const isTappedBulb2 = Patches.getBooleanValue("bulb_2_tapped");
const isTappedSwitch = Patches.getBooleanValue("switch_tapped");
const isTappedBattery = Patches.getBooleanValue("battery_tapped");
const isTappedGlass = Patches.getBooleanValue("glass_tapped");
const isTappedCopper = Patches.getBooleanValue("copper_tapped");

// slot tapped boolean signals
const isTappedSlot1 = Patches.getBooleanValue("slot_1_tapped");
const isTappedSlot2 = Patches.getBooleanValue("slot_2_tapped");
const isTappedSlot3 = Patches.getBooleanValue("slot_3_tapped");
const isTappedSlot4 = Patches.getBooleanValue("slot_4_tapped");

// screen has been long pressed
const isLongPressed = Patches.getBooleanValue("long_pressed");

// stores the selected slot and component
let currentMove = { component: null, slot: null };

// stores components on the board and occupied slots
let movesMade = [];

/* --------------------- monitor component taps --------------------- */

isTappedBulb1.monitor().subscribe(function() {
  currentMove.component = bulb1Object;
});

isTappedBulb2.monitor().subscribe(function() {
  currentMove.component = bulb2Object;
});

isTappedSwitch.monitor().subscribe(function() {
  currentMove.component = switchObject;
});

isTappedBattery.monitor().subscribe(function() {
  currentMove.component = batteryObject;
});

isTappedGlass.monitor().subscribe(function() {
  currentMove.component = glassObject;
});

isTappedCopper.monitor().subscribe(function() {
  currentMove.component = copperObject;
});

/* --------------------- monitor slot taps --------------------- */

isTappedSlot1.monitor().subscribe(function() {
  moveToSlot(slot1Object);
});

isTappedSlot2.monitor().subscribe(function() {
  moveToSlot(slot2Object);
});

isTappedSlot3.monitor().subscribe(function() {
  moveToSlot(slot3Object);
});

isTappedSlot4.monitor().subscribe(function() {
  moveToSlot(slot4Object);
});

/* --------------------- monitor long press --------------------- */

isLongPressed.monitor().subscribe(function(e) {
  resetScene();
});

/* --------------------- functions --------------------- */

function moveToSlot(slot) {
  let slotOccupied = movesMade.some(e => e["slot"] === slot.name);
  if (currentMove.component !== null && !slotOccupied) {
    currentMove.slot = slot;
    currentMove.component.transform.position = slot.transform.position;
    currentMove.component.transform.y = slot.transform.y.add(0.012);
    movesMade.push({
      slot: currentMove.slot.name,
      component: currentMove.component.name
    });
    checkCircuit();
    resetCurrentMove();
  }
}

function resetCurrentMove() {
  currentMove.component = null;
  currentMove.slot = null;
}

// epic fail on this function
function resetScene() {
  /*   bulb1Object.transform.y = 0;
  bulb2Object.transform.y = 0;
  switchObject.transform.y = -0.1624;
  batteryObject.transform.y = 0;
  glassObject.transform.y = 0;
  copperObject.transform.y = 0;

  bulb1Object.transform.x = 0;
  bulb2Object.transform.x = 0;
  switchObject.transform.x = 0.09022;
  batteryObject.transform.x = 0;
  glassObject.transform.x = 0;
  copperObject.transform.x = 0;

  bulb1Object.transform.z = 0;
  bulb2Object.transform.z = 0;
  switchObject.transform.z = -0.0065;
  batteryObject.transform.z = 0;
  glassObject.transform.z = 0;
  copperObject.transform.z = 0; */
}

function checkCircuit() {
  let slot1Occupied = movesMade.some(e => e["slot"] === slot1Object.name);
  let slot2Occupied = movesMade.some(e => e["slot"] === slot2Object.name);
  let slot3Occupied = movesMade.some(e => e["slot"] === slot3Object.name);
  let slot4Occupied = movesMade.some(e => e["slot"] === slot4Object.name);

  // check series 1
  if (slot1Occupied && slot2Occupied && slot4Occupied) {
    var result = movesMade.filter(obj => {
      return (
        obj.slot === slot1Object.name ||
        obj.slot === slot2Object.name ||
        obj.slot === slot4Object.name
      );
    });

    let hasBattery = result.some(e => e["component"] === batteryObject.name);
    let hasBulb1 = result.some(e => e["component"] === bulb1Object.name);
    let hasBulb2 = result.some(e => e["component"] === bulb2Object.name);
    let hasInsulator = result.some(e => e["component"] === glassObject.name);

    if (hasBattery && !hasInsulator && (hasBulb1 || hasBulb2)) {
      lightUp(hasBulb1, hasBulb2);
    }
  }

  // check series 2
  if (slot1Occupied && slot3Occupied && slot4Occupied) {
    var result = movesMade.filter(obj => {
      return (
        obj.slot === slot1Object.name ||
        obj.slot === slot3Object.name ||
        obj.slot === slot4Object.name
      );
    });

    let hasBattery = result.some(e => e["component"] === batteryObject.name);
    let hasBulb1 = result.some(e => e["component"] === bulb1Object.name);
    let hasBulb2 = result.some(e => e["component"] === bulb2Object.name);
    let hasInsulator = result.some(e => e["component"] === glassObject.name);

    if (hasBattery && !hasInsulator && (hasBulb1 || hasBulb2)) {
      lightUp(hasBulb1, hasBulb2);
    }
  }

  // check series 3
  if (slot2Occupied && slot3Occupied) {
    var result = movesMade.filter(obj => {
      return obj.slot === slot2Object.name || obj.slot === slot3Object.name;
    });

    let hasBattery = result.some(e => e["component"] === batteryObject.name);
    let hasBulb1 = result.some(e => e["component"] === bulb1Object.name);
    let hasBulb2 = result.some(e => e["component"] === bulb2Object.name);
    let hasInsulator = result.some(e => e["component"] === glassObject.name);

    if (hasBattery && !hasInsulator && (hasBulb1 || hasBulb2)) {
      lightUp(hasBulb1, hasBulb2);
    }
  }

  // check parallel
  if (slot1Occupied && slot2Occupied && slot3Occupied && slot4Occupied) {
    var result = movesMade.filter(obj => {
      return (
        obj.slot === slot1Object.name ||
        obj.slot === slot2Object.name ||
        obj.slot === slot3Object.name ||
        obj.slot === slot4Object.name
      );
    });

    let hasBattery = result.some(e => e["component"] === batteryObject.name);
    let hasBulb1 = result.some(e => e["component"] === bulb1Object.name);
    let hasBulb2 = result.some(e => e["component"] === bulb2Object.name);
    let hasInsulator = result.some(e => e["component"] === glassObject.name);

    if (hasBattery && !hasInsulator && (hasBulb1 || hasBulb2)) {
      lightUp(hasBulb1, hasBulb2);
    }
  }
}

function lightUp(hasBulb1, hasBulb2) {
  const bulbLitMat = Materials.get("Bulb Lit");
  if (hasBulb1 === true) bulb1Head.material = bulbLitMat;
  if (hasBulb2 === true) bulb2Head.material = bulbLitMat;
}
