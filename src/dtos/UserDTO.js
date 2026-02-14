export default class UserDTO {
  constructor(user) {
    this.id = user._id?.toString() || user._id;
    this.email = user.email;
    // Manejar diferentes formatos de nombres
    this.first_name = user.first_name || user.firstName || user.nombre || 'Usuario';
    this.last_name = user.last_name || user.lastName || user.apellido || '';
    this.age = user.age || user.edad || 0;
    this.role = user.role || 'user';
    this.full_name = `${this.first_name} ${this.last_name}`.trim();
  }

  // Método para devolver información pública (sin email)
  toPublic() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      full_name: this.full_name,
      role: this.role
    };
  }

  // Método para el usuario logueado (con email pero sin password)
  toCurrent() {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      full_name: this.full_name,
      age: this.age,
      role: this.role
    };
  }

  // Método para JWT payload
  toJWT() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      first_name: this.first_name,
      last_name: this.last_name
    };
  }
}
