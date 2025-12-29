const getRefundAmountFromCreditNote = (creditNote) => {
  return Math.round(
    creditNote.lines.reduce((sum, line) => sum + line.totalTTC, 0),
  );
};

module.exports = {
  getRefundAmountFromCreditNote,
};
