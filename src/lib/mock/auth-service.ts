interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class MockAuthService {
  private static demoUser: User = {
    id: 'demo-user',
    email: 'demo@freightflow.com',
    name: 'Demo User',
    role: 'user'
  };

  static async createDemoSession(): Promise<void> {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('demo_user', JSON.stringify(this.demoUser));
  }

  static async getCurrentUser(): Promise<User | null> {
    const userData = localStorage.getItem('demo_user');
    return userData ? JSON.parse(userData) : null;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('demo_user');
  }
}