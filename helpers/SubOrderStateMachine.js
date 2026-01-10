// src/helpers/subOrderStateMachine.js

const SUB_ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PREPARED: "prepared",
  PARTIALLY_PREPARED: "partially_prepared",
  PICKED_UP: "picked_up",
  PARTIALLY_PICKED_UP: "partially_picked_up",
  CANCELLED: "cancelled",
});

const SUB_ORDER_INTENT = Object.freeze({
  CANCEL: "cancel",
  PREPARE: "prepare",
  PICK_UP: "pick_up",
});

const SUB_ORDER_STATUS_GROUPS = {
  pending: [SUB_ORDER_STATUS.PENDING],

  prepared: [SUB_ORDER_STATUS.PREPARED, SUB_ORDER_STATUS.PARTIALLY_PREPARED],

  picked_up: [SUB_ORDER_STATUS.PICKED_UP, SUB_ORDER_STATUS.PARTIALLY_PICKED_UP],

  cancelled: [SUB_ORDER_STATUS.CANCELLED],
};

const SUB_ORDER_STATE_MACHINE = {
  [SUB_ORDER_STATUS.PENDING]: {
    intents: [SUB_ORDER_INTENT.CANCEL, SUB_ORDER_INTENT.PREPARE],
    nextStatuses: [
      SUB_ORDER_STATUS.CANCELLED,
      SUB_ORDER_STATUS.PREPARED,
      SUB_ORDER_STATUS.PARTIALLY_PREPARED,
    ],
  },

  [SUB_ORDER_STATUS.PREPARED]: {
    intents: [SUB_ORDER_INTENT.PICK_UP],
    nextStatuses: [
      SUB_ORDER_STATUS.PICKED_UP,
      SUB_ORDER_STATUS.PARTIALLY_PICKED_UP,
    ],
  },

  [SUB_ORDER_STATUS.PARTIALLY_PREPARED]: {
    intents: [SUB_ORDER_INTENT.PICK_UP],
    nextStatuses: [
      SUB_ORDER_STATUS.PICKED_UP,
      SUB_ORDER_STATUS.PARTIALLY_PICKED_UP,
    ],
  },

  [SUB_ORDER_STATUS.PARTIALLY_PICKED_UP]: {
    intents: [SUB_ORDER_INTENT.PICK_UP],
    nextStatuses: [SUB_ORDER_STATUS.PICKED_UP],
  },

  [SUB_ORDER_STATUS.CANCELLED]: {
    intents: [],
    nextStatuses: [],
  },

  [SUB_ORDER_STATUS.PICKED_UP]: {
    intents: [],
    nextStatuses: [],
  },
};

function assertIntentAllowed(currentStatus, intent) {
  const status = SUB_ORDER_STATE_MACHINE[currentStatus];

  if (!status) {
    throw new Error(`Unknown subOrder status "${currentStatus}"`);
  }

  if (!status.intents.includes(intent)) {
    throw new Error(
      `Intent "${intent}" not allowed from status "${currentStatus}"`,
    );
  }
}

function assertStatusTransitionAllowed(from, to) {
  const status = SUB_ORDER_STATE_MACHINE[from];

  if (!status) {
    throw new Error(`Unknown subOrder status "${from}"`);
  }

  if (!status.nextStatuses.includes(to)) {
    throw new Error(`Invalid transition from "${from}" to "${to}"`);
  }
}

module.exports = {
  SUB_ORDER_STATUS,
  SUB_ORDER_INTENT,
  SUB_ORDER_STATUS_GROUPS,
  SUB_ORDER_STATE_MACHINE,
  assertIntentAllowed,
  assertStatusTransitionAllowed,
};
