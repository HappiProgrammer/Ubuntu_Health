export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  distance: number;
  availability: boolean;
  queueLength: number;
  estimatedWaitTime: number;
  rating: number;
}

const specialties = [
  'General Medicine',
  'Pediatrics',
  'Gynecology',
  'Cardiology'
];

const hospitals = [
  'Central Hospital',
  'Laquintinie Hospital',
  'Bastos Medical Center',
  'General Hospital Yaoundé'
];

export const getMockDoctors = (): Doctor[] => {
  const doctors: Doctor[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
    const availability = Math.random() > 0.2; // 80% available
    const queueLength = Math.floor(Math.random() * 10);
    const estimatedWaitTime = queueLength * (10 + Math.floor(Math.random() * 10)); // 10-20 mins per patient
    
    doctors.push({
      id: `doc_${String(i).padStart(3, '0')}`,
      name: `Dr. ${['N. Mbarga', 'S. Etoo', 'J. Song', 'R. Milla', 'V. Aboubakar', 'K. Toko Ekambi', 'E. Choupo-Moting', 'A. Onana', 'Z. Anguissa', 'C. Fai', 'M. Ngadeu', 'N. Tolo'][i-1]}`,
      specialty,
      hospital,
      distance: Number((Math.random() * 5).toFixed(1)), // 0-5 km
      availability,
      queueLength,
      estimatedWaitTime,
      rating: Number((4 + Math.random()).toFixed(1)) // 4.0 - 5.0
    });
  }
  
  return doctors;
};
