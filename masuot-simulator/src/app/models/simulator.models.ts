export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  status: 'employed' | 'retired' | 'unemployed';
  currentSalary: number;
  expectedSalary: number;
  statusCode:number;
  educationGroup:string;
}

export interface Child {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  educationGroup:string;
}

// 🔥 טיפוס חדש ל-inputs (מינימלי כדי שיעבוד)
export interface SimulatorInputs {
  salary_net_updated: number;
  salary_net: number;

  child_allowance: number;
  women_work_benefit: number;

  community_tax: number;
  mutual_responsibility_cap:number;
  municipal_tax: number;
  arnona: number;

  travel: number;

  children: {
    nursery: number;
    kindergarten: number;
    primary: number;
    middle: number;
    highschool: number;
  };

  health: {
    total: number;
    age_0_50: number;
    age_50_70: number;
    age_70_plus: number;
  };
}

export interface FamilyData {
  familyName: string;
  budgetCode: string;
  familySize: number;
  familyStandard: number;
  incomeForStandard: number;
  members: FamilyMember[];
  children: Child[];

  netSalary: number;
  updatedNetSalary: number;

  inputs: any;
  simulation: any;

  // 🔥 הוסף את זה
  rules: {
    [key: string]: number;
  };
}

export interface AdminParams {
  education: { daycare: number; kindergarten: number; elementary: number; middle: number; high: number; subsidyPercentage: number; };
  health: { young: number; middle: number; senior: number; subsidy: number; };
  communityTax: number;
  propertyTax: number;
  balanceTaxRate: number;
  pensionAddition: number;
  childAllowance: number;
}

export interface SimulationResult {
  currentState: number;
  budgetDistribution: number;
  personalBonus: number;
  womenWorkBenefit: number;
  travel: number;
  periodicGrant: number;
  specialHelp: number;

  totalIncome: number;
  netSalary: number;
  updatedNetSalary: number;

  pension: number;
  survivors: number;
  oldAgePension: number;
  childAllowances: number;
  savingsFund: number;
  pensionAddition: number;

  totalExpenses: number;
  educationExpenses: number;
  healthExpenses: number;

  taxes: number;
  balanceTax: number;
  communityTax: number;
  propertyTax: number;

  netDisposableIncome: number;
  diff: number;
}