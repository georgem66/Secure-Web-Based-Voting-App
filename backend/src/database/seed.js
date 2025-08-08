import bcrypt from 'bcrypt';
import { database } from '../database/connection.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Create admin user
    const adminPassword = 'SecureAdmin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, config.BCRYPT_ROUNDS);

    const adminResult = await database.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [
        config.ADMIN_EMAIL,
        hashedPassword,
        'System',
        'Administrator',
        'admin',
        true,
        true
      ]
    );

    if (adminResult.rows.length > 0) {
      logger.info(`Admin user created: ${adminResult.rows[0].email}`);
    } else {
      logger.info('Admin user already exists');
    }

    // Create test voters
    const testVoters = [
      { email: 'voter1@test.com', firstName: 'Alice', lastName: 'Johnson' },
      { email: 'voter2@test.com', firstName: 'Bob', lastName: 'Smith' },
      { email: 'voter3@test.com', firstName: 'Carol', lastName: 'Davis' },
      { email: 'voter4@test.com', firstName: 'David', lastName: 'Wilson' },
      { email: 'voter5@test.com', firstName: 'Eva', lastName: 'Brown' }
    ];

    const voterPassword = 'TestVoter123!';
    const hashedVoterPassword = await bcrypt.hash(voterPassword, config.BCRYPT_ROUNDS);

    for (const voter of testVoters) {
      try {
        const result = await database.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (email) DO NOTHING
           RETURNING id, email`,
          [
            voter.email,
            hashedVoterPassword,
            voter.firstName,
            voter.lastName,
            'voter',
            true,
            true
          ]
        );

        if (result.rows.length > 0) {
          logger.info(`Test voter created: ${result.rows[0].email}`);
        }
      } catch (error) {
        logger.warn(`Failed to create voter ${voter.email}:`, error.message);
      }
    }

    // Create election
    const electionResult = await database.query(
      `INSERT INTO elections (title, description, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING id, title`,
      [
        'Student Government Election 2024',
        'Annual election for student government representatives',
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in a week
        true
      ]
    );

    if (electionResult.rows.length > 0) {
      logger.info(`Election created: ${electionResult.rows[0].title}`);
    } else {
      logger.info('Election already exists');
    }

    // Create candidates
    const candidates = [
      {
        name: 'Sarah Mitchell',
        party: 'Progressive Students Alliance',
        description: 'Advocating for sustainable campus initiatives, affordable textbooks, and improved mental health services. Former debate team captain with extensive leadership experience.',
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612a3c0?w=300&h=300&fit=crop&crop=face'
      },
      {
        name: 'Marcus Thompson',
        party: 'Student Unity Coalition',
        description: 'Focused on enhancing campus diversity, expanding study spaces, and strengthening career services. Current student body treasurer with proven financial management skills.',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
      },
      {
        name: 'Elena Rodriguez',
        party: 'Future Leaders Party',
        description: 'Champion of academic excellence, improved campus technology, and stronger alumni networks. Head of Computer Science Student Association with tech innovation experience.',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
      },
      {
        name: 'James Chen',
        party: 'Independent',
        description: 'Independent candidate promoting campus transparency, better food services, and expanded recreational facilities. Student athlete with community service leadership.',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
      },
      {
        name: 'Aisha Patel',
        party: 'Green Campus Initiative',
        description: 'Environmental advocate focusing on renewable energy, zero-waste campus goals, and sustainable transportation. Organizer of successful campus green initiatives.',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'
      }
    ];

    for (const candidate of candidates) {
      try {
        const result = await database.query(
          `INSERT INTO candidates (name, party, description, image_url, is_active)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING
           RETURNING id, name`,
          [
            candidate.name,
            candidate.party,
            candidate.description,
            candidate.imageUrl,
            true
          ]
        );

        if (result.rows.length > 0) {
          logger.info(`Candidate created: ${result.rows[0].name}`);
        }
      } catch (error) {
        logger.warn(`Failed to create candidate ${candidate.name}:`, error.message);
      }
    }

    logger.info('Database seeding completed successfully');

    // Log credentials for testing
    console.log('\n=== TEST CREDENTIALS ===');
    console.log('Admin Login:');
    console.log(`  Email: ${config.ADMIN_EMAIL}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('\nTest Voter Login (all have same password):');
    console.log('  Emails: voter1@test.com, voter2@test.com, voter3@test.com, voter4@test.com, voter5@test.com');
    console.log(`  Password: ${voterPassword}`);
    console.log('========================\n');

  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };