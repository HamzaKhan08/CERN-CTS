export enum Role {
  ADMIN = 'ADMIN',
  SCIENTIST = 'SCIENTIST',
  ENGINEER = 'ENGINEER',
  OPERATOR = 'OPERATOR'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string; // Added for login
  password?: string; // Added for login simulation
  role: Role;
  avatar: string;
  department: string;
  joinedAt: string;
  status: UserStatus;
}

export interface SensorData {
  timestamp: number;
  beamIntensity: number; // e11 protons
  magnetTemperature: number; // Kelvin
  vacuumPressure: number; // mbar
  inputVoltage: number; // kV
}

export enum ConverterStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  MAINTENANCE = 'MAINTENANCE'
}

export interface PowerConverter {
  id: string;
  name: string;
  sector: string;
  status: ConverterStatus;
  outputCurrent: number; // Amps
  temperature: number; // Celsius
  lastMaintenance: string;
  efficiency: number; // Percentage
}

export interface SystemLog {
  id: string;
  timestamp: number; // Changed to number for easier sorting
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  module: string;
  message: string;
  user?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'warning' | 'error';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}