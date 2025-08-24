const { sequelize, County, Checklist } = require('../models');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed counties
    const counties = [
      {
        name: 'Los Angeles',
        state: 'CA',
        stateFull: 'California',
        website: 'https://www.ladbss.lacity.org/',
        phone: '(213) 482-7077',
        address: '201 N Figueroa St, Los Angeles, CA 90012',
        contactEmail: 'ladbs@lacity.org',
        processingTime: 45,
        timezone: 'America/Los_Angeles'
      },
      {
        name: 'Orange',
        state: 'CA',
        stateFull: 'California',
        website: 'https://www.ocgov.com/gov/planning/',
        phone: '(714) 667-8888',
        address: '300 N Flower St, Santa Ana, CA 92703',
        contactEmail: 'planning@ocgov.com',
        processingTime: 30,
        timezone: 'America/Los_Angeles'
      },
      {
        name: 'San Diego',
        state: 'CA',
        stateFull: 'California',
        website: 'https://www.sandiego.gov/development-services',
        phone: '(619) 446-5000',
        address: '1222 First Ave, San Diego, CA 92101',
        contactEmail: 'dsd@sandiego.gov',
        processingTime: 35,
        timezone: 'America/Los_Angeles'
      },
      {
        name: 'Miami-Dade',
        state: 'FL',
        stateFull: 'Florida',
        website: 'https://www.miamidade.gov/permits/',
        phone: '(305) 375-2900',
        address: '111 NW 1st St, Miami, FL 33128',
        contactEmail: 'permits@miamidade.gov',
        processingTime: 40,
        timezone: 'America/New_York'
      },
      {
        name: 'Broward',
        state: 'FL',
        stateFull: 'Florida',
        website: 'https://www.broward.org/permits/',
        phone: '(954) 765-4400',
        address: '115 S Andrews Ave, Fort Lauderdale, FL 33301',
        contactEmail: 'permits@broward.org',
        processingTime: 35,
        timezone: 'America/New_York'
      },
      {
        name: 'Harris',
        state: 'TX',
        stateFull: 'Texas',
        website: 'https://www.harriscountytx.gov/permits/',
        phone: '(713) 274-3900',
        address: '1001 Preston St, Houston, TX 77002',
        contactEmail: 'permits@harriscountytx.gov',
        processingTime: 25,
        timezone: 'America/Chicago'
      }
    ];

    console.log('Creating counties...');
    const createdCounties = await County.bulkCreate(counties, { returning: true });
    console.log(`Created ${createdCounties.length} counties`);

    // Seed checklists for each county
    const checklists = [];

    createdCounties.forEach(county => {
      // Common checklists for all counties
      const commonChecklists = [
        {
          name: 'Building Permit Application',
          description: 'Complete building permit application form',
          category: 'required',
          projectTypes: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
          estimatedCost: 150.00,
          processingTime: 2,
          order: 1,
          countyId: county.id
        },
        {
          name: 'Site Plan',
          description: 'Detailed site plan showing property boundaries and building location',
          category: 'required',
          projectTypes: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
          estimatedCost: 200.00,
          processingTime: 3,
          order: 2,
          countyId: county.id
        },
        {
          name: 'Construction Plans',
          description: 'Detailed construction drawings and specifications',
          category: 'required',
          projectTypes: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
          estimatedCost: 500.00,
          processingTime: 5,
          order: 3,
          countyId: county.id
        },
        {
          name: 'Structural Calculations',
          description: 'Engineer-stamped structural calculations',
          category: 'required',
          projectTypes: ['commercial', 'industrial', 'new_construction'],
          estimatedCost: 800.00,
          processingTime: 7,
          order: 4,
          countyId: county.id
        },
        {
          name: 'Energy Compliance',
          description: 'Energy code compliance documentation',
          category: 'required',
          projectTypes: ['residential', 'commercial', 'new_construction'],
          estimatedCost: 300.00,
          processingTime: 4,
          order: 5,
          countyId: county.id
        },
        {
          name: 'Fire Safety Review',
          description: 'Fire department review and approval',
          category: 'required',
          projectTypes: ['commercial', 'industrial'],
          estimatedCost: 250.00,
          processingTime: 3,
          order: 6,
          countyId: county.id
        },
        {
          name: 'Environmental Impact Assessment',
          description: 'Environmental impact study for large projects',
          category: 'conditional',
          projectTypes: ['commercial', 'industrial', 'new_construction'],
          estimatedCost: 1500.00,
          processingTime: 14,
          order: 7,
          countyId: county.id
        },
        {
          name: 'Traffic Impact Study',
          description: 'Traffic impact analysis for commercial projects',
          category: 'conditional',
          projectTypes: ['commercial', 'industrial'],
          estimatedCost: 1200.00,
          processingTime: 10,
          order: 8,
          countyId: county.id
        },
        {
          name: 'Archeological Survey',
          description: 'Archeological assessment for historical areas',
          category: 'conditional',
          projectTypes: ['new_construction'],
          estimatedCost: 800.00,
          processingTime: 7,
          order: 9,
          countyId: county.id
        },
        {
          name: 'Landscape Plan',
          description: 'Landscaping and irrigation plan',
          category: 'optional',
          projectTypes: ['residential', 'commercial', 'new_construction'],
          estimatedCost: 150.00,
          processingTime: 2,
          order: 10,
          countyId: county.id
        }
      ];

      checklists.push(...commonChecklists);
    });

    console.log('Creating checklists...');
    const createdChecklists = await Checklist.bulkCreate(checklists, { returning: true });
    console.log(`Created ${createdChecklists.length} checklists`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
