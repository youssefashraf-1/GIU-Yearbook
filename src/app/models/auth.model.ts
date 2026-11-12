export interface User {
  studentId: number;
  name: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}
