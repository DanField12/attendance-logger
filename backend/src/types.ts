export interface attendee {
  id: string,
  firstname: string,
  lastname: string,
  date: Date,
}

export interface newMember {
  id: string,
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  date: Date,
}

export interface fullName {
  id: string,
  firstname: string,
  lastname: string,
  familyId: string,
}