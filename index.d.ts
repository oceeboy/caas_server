declare namespace Express {
  interface User {
    _id: string;
    name: string;
    email: string;
    orgId: string;
    role: 'admin' | 'agent' | 'user'; // extend if you have more roles
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    __v: number;
  }
}
