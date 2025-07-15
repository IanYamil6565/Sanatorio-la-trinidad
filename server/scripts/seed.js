import { executeQuery, testConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    await executeQuery('TRUNCATE TABLE appointments');
    await executeQuery('TRUNCATE TABLE reminders');
    await executeQuery('TRUNCATE TABLE blog_posts');
    await executeQuery('TRUNCATE TABLE calendar_events');
    await executeQuery('TRUNCATE TABLE tutorials');
    await executeQuery('TRUNCATE TABLE patients');
    await executeQuery('TRUNCATE TABLE users');
    await executeQuery('TRUNCATE TABLE staff');
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');

    // Seed staff
    console.log('👥 Seeding staff...');
    const staffData = [
      {
        first_name: 'Dr. María',
        last_name: 'González',
        email: 'maria.gonzalez@sanatoriolatrinidad.com',
        phone: '+34 666 123 456',
        position: 'Jefe de Cardiología',
        department: 'Cardiología',
        specialty: 'Cardiología Intervencionista',
        type: 'doctor',
        status: 'active',
        hire_date: '2018-03-15',
        bio: 'Especialista en cardiología con más de 15 años de experiencia en procedimientos intervencionistas',
        avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
        certifications: JSON.stringify(['Cardiología', 'Hemodinámica', 'Ecocardiografía']),
        keywords: JSON.stringify(['corazón', 'cardiovascular', 'intervencionista'])
      },
      {
        first_name: 'Dr. Carlos',
        last_name: 'Rodríguez',
        email: 'carlos.rodriguez@sanatoriolatrinidad.com',
        phone: '+34 666 234 567',
        position: 'Neurocirujano',
        department: 'Neurología',
        specialty: 'Neurocirugía',
        type: 'doctor',
        status: 'active',
        hire_date: '2020-01-10',
        bio: 'Especialista en neurocirugía mínimamente invasiva con formación internacional',
        avatar: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
        certifications: JSON.stringify(['Neurocirugía', 'Cirugía Cerebral']),
        keywords: JSON.stringify(['cerebro', 'neurología', 'cirugía'])
      },
      {
        first_name: 'Ana',
        last_name: 'Martín',
        email: 'ana.martin@sanatoriolatrinidad.com',
        phone: '+34 666 345 678',
        position: 'Enfermera Jefe',
        department: 'UCI',
        type: 'nurse',
        status: 'active',
        hire_date: '2019-06-20',
        bio: 'Enfermera especializada en cuidados intensivos con certificación en soporte vital avanzado',
        avatar: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
        certifications: JSON.stringify(['Enfermería', 'Cuidados Intensivos']),
        keywords: JSON.stringify(['cuidados', 'intensivos', 'enfermería'])
      },
      {
        first_name: 'Luis',
        last_name: 'Fernández',
        email: 'luis.fernandez@sanatoriolatrinidad.com',
        phone: '+34 666 456 789',
        position: 'Administrador',
        department: 'Administración',
        type: 'administrative',
        status: 'active',
        hire_date: '2017-09-05',
        bio: 'Responsable de gestión administrativa y recursos humanos del sanatorio',
        avatar: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=400',
        keywords: JSON.stringify(['administración', 'gestión', 'recursos'])
      },
      {
        first_name: 'Carmen',
        last_name: 'López',
        email: 'carmen.lopez@sanatoriolatrinidad.com',
        phone: '+34 666 789 012',
        position: 'Recepcionista Principal',
        department: 'Recepción',
        type: 'reception',
        status: 'active',
        hire_date: '2021-08-15',
        bio: 'Encargada de atención al paciente y gestión de citas en recepción principal',
        avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
        keywords: JSON.stringify(['recepción', 'atención', 'citas'])
      },
      {
        first_name: 'Roberto',
        last_name: 'Silva',
        email: 'roberto.silva@sanatoriolatrinidad.com',
        phone: '+34 666 890 123',
        position: 'Supervisor Call Center',
        department: 'Call Center',
        type: 'call_center',
        status: 'active',
        hire_date: '2020-03-10',
        bio: 'Supervisor del centro de llamadas y atención telefónica a pacientes',
        avatar: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
        keywords: JSON.stringify(['call center', 'telefónico', 'atención'])
      }
    ];

    for (const staff of staffData) {
      await executeQuery(
        `INSERT INTO staff (first_name, last_name, email, phone, position, department, specialty, type, status, hire_date, bio, avatar, certifications, keywords) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [staff.first_name, staff.last_name, staff.email, staff.phone, staff.position, staff.department, 
         staff.specialty || null, staff.type, staff.status, staff.hire_date, staff.bio, staff.avatar, 
         staff.certifications, staff.keywords]
      );
    }

    // Create admin user
    console.log('🔐 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await executeQuery(
      'INSERT INTO users (email, password, role, staff_id) VALUES (?, ?, ?, ?)',
      ['admin@sanatoriolatrinidad.com', hashedPassword, 'admin', 1]
    );

    // Seed patients
    console.log('🏥 Seeding patients...');
    const patientsData = [
      {
        first_name: 'Juan',
        last_name: 'Pérez',
        document: '12345678',
        phone: '+34 666 111 222',
        email: 'juan.perez@email.com'
      },
      {
        first_name: 'María',
        last_name: 'García',
        document: '87654321',
        phone: '+34 666 333 444',
        email: 'maria.garcia@email.com'
      },
      {
        first_name: 'Carlos',
        last_name: 'López',
        document: '11223344',
        phone: '+34 666 555 666',
        email: 'carlos.lopez@email.com'
      }
    ];

    for (const patient of patientsData) {
      await executeQuery(
        'INSERT INTO patients (first_name, last_name, document, phone, email) VALUES (?, ?, ?, ?, ?)',
        [patient.first_name, patient.last_name, patient.document, patient.phone, patient.email]
      );
    }

    // Seed sample appointments
    console.log('📅 Seeding appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await executeQuery(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, tomorrow.toISOString().split('T')[0], '09:00:00', 'confirmed', 'Control de rutina']
    );

    // Seed reminders
    console.log('⏰ Seeding reminders...');
    await executeQuery(
      `INSERT INTO reminders (title, description, type, priority, due_date, due_time, assigned_to, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Revisión de equipos', 'Verificar estado de equipos de emergencia', 'maintenance', 'high', 
       today.toISOString().split('T')[0], '14:00:00', 3, 1, 'pending']
    );

    // Seed blog posts
    console.log('📝 Seeding blog posts...');
    await executeQuery(
      `INSERT INTO blog_posts (title, content, excerpt, author_id, category, tags, status, priority, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Nuevo Protocolo COVID-19', 
       'Se implementa un nuevo protocolo de seguridad para el manejo de pacientes con COVID-19...', 
       'Implementación de nuevas medidas de bioseguridad', 
       1, 'announcement', JSON.stringify(['covid-19', 'seguridad']), 'published', 'high', new Date()]
    );

    console.log('✅ Database seeded successfully!');
    console.log('🔑 Admin credentials:');
    console.log('   Email: admin@sanatoriolatrinidad.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedDatabase();