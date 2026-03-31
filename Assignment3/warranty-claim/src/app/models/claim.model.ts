export interface DealerInfo {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  stateOrCountry: string;
}

export interface Customer {
  companyName: string;
  ownerName: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
}

export interface Machine {
  serialNumber: string;
  modelType: string;
  machineType: string;
  brand: string;
  fuelType: string;
}

export interface PartUsed {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  _id: string;
}

export interface JobDetail {
  jobCode: string;
  jobDescription: string;
  partsUsed: PartUsed[];
}

export interface JobCartId {
  jobCartId: string;
  ticketId: {
    customer: Customer;
    machine: Machine;
  };
  jobDetails: JobDetail[];
}

export interface Claim {
  _id: string;
  claimNo: string;
  warrantyStatus: string;
  cwrNo: string;
  creditNoteRef: string;
  originalInvoice1: string;
  dealerInfo: DealerInfo;
  claimSubmissionDate: string;
  repairDate: string;
  failureDate: string;
  dateReceived: string;
  startupDate: string;
  failureDescription: string;
  correctiveAction: string;
  suspectedCauseOfDamage: string;
  typeOfApplication: string;
  operatingHours: number;
  totalPartsCost: number;
  laborTotal: number;
  totalTravelCost: number;
  totalCarCost: number;
  totalTransportCost: number;
  totalClaimAmount: number;
  laborHoursClaimed: number;
  laborRate: number;
  travelOtherCosts: number;
  reportedByName: string;
  reportedByEmail: string;
  jobCartId: JobCartId;
}

export interface ClaimListItem {
  _id: string;
  claimNo: string;
  warrantyStatus: string;
}