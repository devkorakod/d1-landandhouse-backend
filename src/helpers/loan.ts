export interface LoanInput {
  price: number;
  downPaymentPercent?: number;
  downPaymentAmount?: number;
  interestRate: number;   // ต่อปี เป็น %
  termYears: number;
}

export interface LoanResult {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: { year: number; principalPaid: number; interestPaid: number; remainingBalance: number }[];
}

/**
 * สูตรค่างวดคงที่ (annuity):
 *   M = P × [ i(1+i)^n ] / [ (1+i)^n − 1 ]
 * ผลลัพธ์เป็นการประมาณการเบื้องต้นเท่านั้น ไม่ใช่ข้อเสนอสินเชื่อ
 */
export function calculateLoan(input: LoanInput): LoanResult {
  const { price, interestRate, termYears } = input;
  const down = input.downPaymentAmount
    ?? (price * (input.downPaymentPercent ?? 0)) / 100;
  const principal = Math.max(0, price - down);
  const n = Math.round(termYears * 12);
  const i = interestRate / 100 / 12;

  const monthly = i === 0
    ? principal / n
    : (principal * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);

  const schedule: LoanResult['schedule'] = [];
  let balance = principal;
  for (let year = 1; year <= termYears; year++) {
    let principalPaid = 0;
    let interestPaid = 0;
    for (let m = 0; m < 12 && balance > 0; m++) {
      const interest = balance * i;
      const principalPart = Math.min(monthly - interest, balance);
      interestPaid += interest;
      principalPaid += principalPart;
      balance -= principalPart;
    }
    schedule.push({
      year,
      principalPaid: round(principalPaid),
      interestPaid: round(interestPaid),
      remainingBalance: round(Math.max(0, balance)),
    });
  }

  const totalPayment = round(monthly * n);
  return {
    loanAmount: round(principal),
    monthlyPayment: round(monthly),
    totalInterest: round(totalPayment - principal),
    totalPayment,
    schedule,
  };
}

const round = (n: number) => Math.round(n * 100) / 100;
