

document.addEventListener('DOMContentLoaded', () => {
  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  let currentUser = { name: 'Employee1' }; 
  let approvers = [
    { role: 'Manager', name: 'Manager1', sequence: 1 },
    { role: 'Finance', name: 'Finance1', sequence: 2 },
    { role: 'Director', name: 'Director1', sequence: 3 }
  ];

  const expenseForm = document.getElementById('expenseForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const expense = {
        id: Date.now(),
        user: currentUser.name,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        description: data.description,
        date: data.date,
        status: 'Pending',
        currentApprover: 0,
        approvals: []
      };
      expenses.push(expense);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      alert('💰 Expense submitted!');
      displayExpenseHistory();
    });
  }

  function displayExpenseHistory() {
    const tbody = document.getElementById('expenseHistoryBody');
    if (tbody) {
      tbody.innerHTML = '';
      const userExpenses = expenses.filter(exp => exp.user === currentUser.name);
      userExpenses.forEach(expense => {
        tbody.innerHTML += `
          <tr>
            <td>${expense.amount}</td>
            <td>${expense.currency}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>${expense.date}</td>
            <td>${expense.status === 'Approved' ? '✅ Approved' : expense.status === 'Rejected' ? '❌ Rejected' : '🕰 Pending'}</td>
          </tr>
        `;
      });
    }
  }
  displayExpenseHistory();

  const approvalTbody = document.getElementById('approvalTableBody');
  if (approvalTbody) {
    approvalTbody.innerHTML = '';
    expenses.forEach(expense => {
      if (expense.status === 'Pending' && expense.currentApprover < approvers.length) {
        approvalTbody.innerHTML += `
          <tr>
            <td>${expense.user}</td>
            <td>${expense.amount}</td>
            <td>${expense.currency}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>
              <button onclick="approveExpense(${expense.id}, 'Approved')">✅ Approve</button>
              <button onclick="approveExpense(${expense.id}, 'Rejected')">❌ Reject</button>
            </td>
          </tr>
        `;
      }
    });
  }
});

function approveExpense(id, action) {
  let expenses = JSON.parse(localStorage.getItem('expenses'));
  let approvers = [
    { role: 'Manager', name: 'Manager1', sequence: 1 },
    { role: 'Finance', name: 'Finance1', sequence: 2 },
    { role: 'Director', name: 'Director1', sequence: 3 }
  ];
  expenses = expenses.map(exp => {
    if (exp.id == id) {
      exp.approvals.push({ approver: approvers[exp.currentApprover].name, action });
      if (action === 'Approved') {
        exp.currentApprover += 1;
        if (exp.currentApprover >= approvers.length) {
          exp.status = checkApprovalRules(exp.approvals) ? 'Approved' : 'Rejected';
        }
      } else {
        exp.status = 'Rejected';
      }
    }
    return exp;
  });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  alert(`⚖ Expense ${action}!`); // 👈 Fixed missing quotes here 🌟
  location.reload();
}

function checkApprovalRules(approvals) {
  const approveCount = approvals.filter(a => a.action === 'Approved').length;
  const totalApprovers = 3;
  const percentRule = approveCount / totalApprovers >= 0.6; 
  const directorApproved = approvals.some(a => a.approver === 'Director1');
  return percentRule || directorApproved;
}

