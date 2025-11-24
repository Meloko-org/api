const VALID_STATUSES = ["pending", "validated", "withdrawn", "canceled"];

function computeGlobalOrderStatus(order) {
  const subStatuses = order.details
    .map((d) => d.status)
    .filter((s) => VALID_STATUSES.includes(s));

  const unique = Array.from(new Set(subStatuses));

  if (unique.length === 1) {
    return [unique[0]];
  }

  return unique.map(
    (status) => "partial" + status.charAt(0).toUpperCase() + status.slice(1),
  );
}

module.exports = {
  computeGlobalOrderStatus,
};
