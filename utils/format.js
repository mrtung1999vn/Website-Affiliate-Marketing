// Định dạng số tiền về dạng 1.000.000 đ
function formatCurrency(amount) {
  if (typeof amount !== 'number') return amount;
  return amount.toLocaleString('vi-VN') + ' đ';
}

// Định dạng ngày về dd/mm/yyyy
function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date)) return '-';
  return date.toLocaleDateString('vi-VN');
}

// Lấy thời gian hiện tại định dạng ISO
function nowISO() {
  return new Date().toISOString();
}

module.exports = {
  formatCurrency,
  formatDate,
  nowISO
};
