import { addDays, startOfDay } from 'date-fns';

type ClassEntity = {
  id: number;
  name: string;
  description: string;
  level: string;
  durationMinutes: number;
  maxCapacity: number;
  priceCents: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ScheduleEntity = {
  id: number;
  classId: number;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  active: boolean;
  createdAt: Date;
};

type StudentEntity = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  createdAt: Date;
};

type AppointmentEntity = {
  id: number;
  scheduleId: number;
  studentId: number;
  classId: number;
  status: string;
  notes: string | null;
  createdAt: Date;
};

let classIdSeq = 5;
let scheduleIdSeq = 20;
let studentIdSeq = 3;
let appointmentIdSeq = 5;

function seedClasses(): ClassEntity[] {
  return [
    {
      id: 1,
      name: 'Desenho Realista',
      description:
        'Aprenda técnicas de sombreamento, luz e sombra para criar retratos e objetos com aparência realista. Lápis grafite, carvão e esfuminho.',
      level: 'Iniciante',
      durationMinutes: 90,
      maxCapacity: 6,
      priceCents: 8000,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Mangá & Anime',
      description:
        'Desenhe personagens no estilo japonês: proporções, expressões, olhar animado, poses dinâmicas e cenários. Do esboço ao acabamento com nanquim/marcador.',
      level: 'Intermediário',
      durationMinutes: 90,
      maxCapacity: 8,
      priceCents: 7500,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'Aquarela para Iniciantes',
      description:
        'Mistura de cores, molhagem do papel, degradê, lavagens e texturas com tinta aquarela. Pintura de paisagens e natureza morta.',
      level: 'Iniciante',
      durationMinutes: 120,
      maxCapacity: 5,
      priceCents: 12000,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'Figura Humana',
      description:
        'Estudo de gesto, proporção áurea, anatomia básica (esqueleto e músculos) e movimento. Aulas com modelo vivo (foto referência).',
      level: 'Avançado',
      durationMinutes: 120,
      maxCapacity: 6,
      priceCents: 15000,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      name: 'Letterings & Tipografia',
      description:
        'Criação de composições manuais com letras, brush pen, efeitos 3D e dourados. Ideal para quem quer produzir artes para redes sociais.',
      level: 'Iniciante',
      durationMinutes: 90,
      maxCapacity: 8,
      priceCents: 7000,
      active: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

function seedSchedules(classes: ClassEntity[]): ScheduleEntity[] {
  const out: ScheduleEntity[] = [];
  const picks: Array<{ days: number[]; times: Array<{ h: number; min: number; endH: number; endMin: number; classId: number; cap: number; booked: number }> }> = [
    {
      days: [0, 2, 4, 6],
      times: [
        { h: 9, min: 0, endH: 10, endMin: 30, classId: 1, cap: 6, booked: 2 },
        { h: 14, min: 0, endH: 15, endMin: 30, classId: 2, cap: 8, booked: 5 },
        { h: 19, min: 0, endH: 20, endMin: 30, classId: 3, cap: 5, booked: 1 },
      ],
    },
    {
      days: [1, 3, 5],
      times: [
        { h: 10, min: 0, endH: 12, endMin: 0, classId: 4, cap: 6, booked: 4 },
        { h: 15, min: 30, endH: 17, endMin: 0, classId: 1, cap: 6, booked: 0 },
        { h: 20, min: 0, endH: 21, endMin: 30, classId: 2, cap: 8, booked: 7 },
      ],
    },
  ];
  let id = 1;
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const day = addDays(today, i);
    const weekday = day.getDay();
    for (const block of picks) {
      if (!block.days.includes(weekday)) continue;
      for (const t of block.times) {
        out.push({
          id: id++,
          classId: t.classId,
          date: startOfDay(day),
          startTime: `${String(t.h).padStart(2, '0')}:${String(t.min).padStart(2, '0')}`,
          endTime: `${String(t.endH).padStart(2, '0')}:${String(t.endMin).padStart(2, '0')}`,
          capacity: t.cap,
          bookedCount: t.booked,
          active: true,
          createdAt: new Date(),
        });
      }
    }
  }
  scheduleIdSeq = id + 1;
  return out;
}

function seedStudents(): StudentEntity[] {
  return [
    { id: 1, name: 'Ana Beatriz Costa', phone: '11987654321', email: 'ana@example.com', createdAt: new Date() },
    { id: 2, name: 'Lucas Pereira', phone: '11912345678', email: 'lucas@example.com', createdAt: new Date() },
    { id: 3, name: 'Mariana Silva', phone: '11955554444', email: 'mariana@example.com', createdAt: new Date() },
  ];
}

function seedAppointments(schedules: ScheduleEntity[]): AppointmentEntity[] {
  return [
    { id: 1, scheduleId: schedules[0]?.id ?? 1, studentId: 1, classId: 1, status: 'confirmed', notes: 'Primeira aula', createdAt: new Date() },
    { id: 2, scheduleId: schedules[1]?.id ?? 2, studentId: 2, classId: 2, status: 'confirmed', notes: null, createdAt: new Date() },
    { id: 3, scheduleId: schedules[2]?.id ?? 3, studentId: 3, classId: 3, status: 'attended', notes: 'Bom desempenho', createdAt: new Date() },
    { id: 4, scheduleId: schedules[3]?.id ?? 4, studentId: 1, classId: 4, status: 'missed', notes: 'Não avisou', createdAt: new Date() },
    { id: 5, scheduleId: schedules[5]?.id ?? 6, studentId: 2, classId: 1, status: 'cancelled', notes: null, createdAt: new Date() },
  ];
}

class MockStore {
  classes: ClassEntity[];
  schedules: ScheduleEntity[];
  students: StudentEntity[];
  appointments: AppointmentEntity[];

  constructor() {
    this.classes = seedClasses();
    this.schedules = seedSchedules(this.classes);
    this.students = seedStudents();
    this.appointments = seedAppointments(this.schedules);
  }

  findOrCreateStudent(name: string, phone: string, email?: string | null): StudentEntity {
    const clean = phone.replace(/\D/g, '');
    let s = this.students.find((x) => x.phone.replace(/\D/g, '') === clean);
    if (!s) {
      s = {
        id: ++studentIdSeq,
        name,
        phone: clean,
        email: email || null,
        createdAt: new Date(),
      };
      this.students.push(s);
    }
    return s;
  }

  nextClassId() {
    return ++classIdSeq;
  }
  nextScheduleId() {
    return ++scheduleIdSeq;
  }
  nextAppointmentId() {
    return ++appointmentIdSeq;
  }
}

export const mockStore = new MockStore();
export type { ClassEntity, ScheduleEntity, StudentEntity, AppointmentEntity };
