const { sequelize, User, County, Checklist } = require('../models');
const bcrypt = require('bcryptjs');

const floridaCounties = [
  { name: 'Alachua', website: 'https://www.alachuacounty.us/', phone: '(352) 374-5249', address: '12 SE 1st St, Gainesville, FL 32601', contactEmail: 'permits@alachuacounty.us' },
  { name: 'Baker', website: 'https://www.bakercountyfl.org/', phone: '(904) 259-8113', address: '55 N 3rd St, Macclenny, FL 32063', contactEmail: 'permits@bakercountyfl.org' },
  { name: 'Bay', website: 'https://www.baycountyfl.gov/', phone: '(850) 248-8250', address: '840 W 11th St, Panama City, FL 32401', contactEmail: 'permits@baycountyfl.gov' },
  { name: 'Bradford', website: 'https://www.bradfordcountyfl.gov/', phone: '(904) 966-6327', address: '945 N Temple Ave, Starke, FL 32091', contactEmail: 'permits@bradfordcountyfl.gov' },
  { name: 'Brevard', website: 'https://www.brevardcounty.us/', phone: '(321) 633-2069', address: '2725 Judge Fran Jamieson Way, Viera, FL 32940', contactEmail: 'permits@brevardcounty.us' },
  { name: 'Broward', website: 'https://www.broward.org/', phone: '(954) 765-4400', address: '115 S Andrews Ave, Fort Lauderdale, FL 33301', contactEmail: 'permits@broward.org' },
  { name: 'Calhoun', website: 'https://www.calhouncountygov.com/', phone: '(850) 674-4545', address: '20859 Central Ave E, Blountstown, FL 32424', contactEmail: 'permits@calhouncountygov.com' },
  { name: 'Charlotte', website: 'https://www.charlottecountyfl.gov/', phone: '(941) 743-1201', address: '18500 Murdock Circle, Port Charlotte, FL 33948', contactEmail: 'permits@charlottecountyfl.gov' },
  { name: 'Citrus', website: 'https://www.citrusbocc.com/', phone: '(352) 527-5211', address: '110 N Apopka Ave, Inverness, FL 34450', contactEmail: 'permits@citrusbocc.com' },
  { name: 'Clay', website: 'https://www.claycountygov.com/', phone: '(904) 284-6400', address: '477 Houston St, Green Cove Springs, FL 32043', contactEmail: 'permits@claycountygov.com' },
  { name: 'Collier', website: 'https://www.colliercountyfl.gov/', phone: '(239) 252-2400', address: '3299 Tamiami Trail E, Naples, FL 34112', contactEmail: 'permits@colliercountyfl.gov' },
  { name: 'Columbia', website: 'https://www.columbiacountyfla.com/', phone: '(386) 758-1005', address: '135 NE Hernando Ave, Lake City, FL 32055', contactEmail: 'permits@columbiacountyfla.com' },
  { name: 'DeSoto', website: 'https://www.desotobocc.com/', phone: '(863) 993-4800', address: '201 E Oak St, Arcadia, FL 34266', contactEmail: 'permits@desotobocc.com' },
  { name: 'Dixie', website: 'https://www.dixiecounty.org/', phone: '(352) 498-1200', address: '160 NE 141st Ave, Cross City, FL 32628', contactEmail: 'permits@dixiecounty.org' },
  { name: 'Duval', website: 'https://www.coj.net/', phone: '(904) 255-7900', address: '117 W Duval St, Jacksonville, FL 32202', contactEmail: 'permits@coj.net' },
  { name: 'Escambia', website: 'https://www.escambiagov.net/', phone: '(850) 595-4910', address: '221 Palafox Pl, Pensacola, FL 32502', contactEmail: 'permits@escambiagov.net' },
  { name: 'Flagler', website: 'https://www.flaglercounty.org/', phone: '(386) 313-4000', address: '1769 E Moody Blvd, Bunnell, FL 32110', contactEmail: 'permits@flaglercounty.org' },
  { name: 'Franklin', website: 'https://www.franklincountyflorida.com/', phone: '(850) 653-9783', address: '34 Forbes St, Apalachicola, FL 32320', contactEmail: 'permits@franklincountyflorida.com' },
  { name: 'Gadsden', website: 'https://www.gadsdengov.net/', phone: '(850) 875-8665', address: '9 E Jefferson St, Quincy, FL 32351', contactEmail: 'permits@gadsdengov.net' },
  { name: 'Gilchrist', website: 'https://www.gilchristcounty.org/', phone: '(352) 463-3170', address: '112 S Main St, Trenton, FL 32693', contactEmail: 'permits@gilchristcounty.org' },
  { name: 'Glades', website: 'https://www.myglades.com/', phone: '(863) 946-6020', address: '500 Ave J SW, Moore Haven, FL 33471', contactEmail: 'permits@myglades.com' },
  { name: 'Gulf', website: 'https://www.gulfcounty-fl.gov/', phone: '(850) 229-6113', address: '1000 Cecil G Costin Sr Blvd, Port St Joe, FL 32456', contactEmail: 'permits@gulfcounty-fl.gov' },
  { name: 'Hamilton', website: 'https://www.hamiltoncountyfl.com/', phone: '(386) 792-1288', address: '207 NE 1st St, Jasper, FL 32052', contactEmail: 'permits@hamiltoncountyfl.com' },
  { name: 'Hardee', website: 'https://www.hardeecounty.net/', phone: '(863) 773-2161', address: '412 N 6th Ave, Wauchula, FL 33873', contactEmail: 'permits@hardeecounty.net' },
  { name: 'Hendry', website: 'https://www.hendryfla.net/', phone: '(863) 675-5220', address: '640 S Main St, LaBelle, FL 33935', contactEmail: 'permits@hendryfla.net' },
  { name: 'Hernando', website: 'https://www.hernandocounty.us/', phone: '(352) 754-4000', address: '20 N Main St, Brooksville, FL 34601', contactEmail: 'permits@hernandocounty.us' },
  { name: 'Highlands', website: 'https://www.hcbcc.org/', phone: '(863) 402-6500', address: '600 S Commerce Ave, Sebring, FL 33870', contactEmail: 'permits@hcbcc.org' },
  { name: 'Hillsborough', website: 'https://www.hillsboroughcounty.org/', phone: '(813) 272-5900', address: '601 E Kennedy Blvd, Tampa, FL 33602', contactEmail: 'permits@hillsboroughcounty.org' },
  { name: 'Holmes', website: 'https://www.holmescountyfl.org/', phone: '(850) 547-1119', address: '107 E Virginia Ave, Bonifay, FL 32425', contactEmail: 'permits@holmescountyfl.org' },
  { name: 'Indian River', website: 'https://www.ircgov.com/', phone: '(772) 226-1223', address: '1801 27th St, Vero Beach, FL 32960', contactEmail: 'permits@ircgov.com' },
  { name: 'Jackson', website: 'https://www.jacksoncountyfl.com/', phone: '(850) 482-9633', address: '2864 Madison St, Marianna, FL 32448', contactEmail: 'permits@jacksoncountyfl.com' },
  { name: 'Jefferson', website: 'https://www.jeffersoncountyfl.gov/', phone: '(850) 342-0218', address: '375 W Water St, Monticello, FL 32344', contactEmail: 'permits@jeffersoncountyfl.gov' },
  { name: 'Lafayette', website: 'https://www.lafayettecountyfl.net/', phone: '(386) 294-1600', address: '120 W Main St, Mayo, FL 32066', contactEmail: 'permits@lafayettecountyfl.net' },
  { name: 'Lake', website: 'https://www.lakecountyfl.gov/', phone: '(352) 253-5000', address: '315 W Main St, Tavares, FL 32778', contactEmail: 'permits@lakecountyfl.gov' },
  { name: 'Lee', website: 'https://www.leegov.com/', phone: '(239) 533-8000', address: '2115 2nd St, Fort Myers, FL 33901', contactEmail: 'permits@leegov.com' },
  { name: 'Leon', website: 'https://www.leoncountyfl.gov/', phone: '(850) 606-5000', address: '301 S Monroe St, Tallahassee, FL 32301', contactEmail: 'permits@leoncountyfl.gov' },
  { name: 'Levy', website: 'https://www.levycounty.org/', phone: '(352) 486-5266', address: '310 S Court St, Bronson, FL 32621', contactEmail: 'permits@levycounty.org' },
  { name: 'Liberty', website: 'https://www.libertycountyfl.com/', phone: '(850) 643-2215', address: '10818 NW SR 20, Bristol, FL 32321', contactEmail: 'permits@libertycountyfl.com' },
  { name: 'Madison', website: 'https://www.madisoncountyfl.com/', phone: '(850) 973-3179', address: '229 SW Pinckney St, Madison, FL 32340', contactEmail: 'permits@madisoncountyfl.com' },
  { name: 'Manatee', website: 'https://www.mymanatee.org/', phone: '(941) 748-4501', address: '1112 Manatee Ave W, Bradenton, FL 34205', contactEmail: 'permits@mymanatee.org' },
  { name: 'Marion', website: 'https://www.marioncountyfl.org/', phone: '(352) 438-2300', address: '601 SE 25th Ave, Ocala, FL 34471', contactEmail: 'permits@marioncountyfl.org' },
  { name: 'Martin', website: 'https://www.martin.fl.us/', phone: '(772) 288-5400', address: '2401 SE Monterey Rd, Stuart, FL 34996', contactEmail: 'permits@martin.fl.us' },
  { name: 'Miami-Dade', website: 'https://www.miamidade.gov/', phone: '(305) 375-2900', address: '111 NW 1st St, Miami, FL 33128', contactEmail: 'permits@miamidade.gov' },
  { name: 'Monroe', website: 'https://www.monroecounty-fl.gov/', phone: '(305) 292-4400', address: '1100 Simonton St, Key West, FL 33040', contactEmail: 'permits@monroecounty-fl.gov' },
  { name: 'Nassau', website: 'https://www.nassaucountyfl.com/', phone: '(904) 491-7300', address: '96135 Nassau Pl, Yulee, FL 32097', contactEmail: 'permits@nassaucountyfl.com' },
  { name: 'Okaloosa', website: 'https://www.okaloosagov.com/', phone: '(850) 651-7100', address: '302 Wilson St N, Crestview, FL 32536', contactEmail: 'permits@okaloosagov.com' },
  { name: 'Okeechobee', website: 'https://www.co.okeechobee.fl.us/', phone: '(863) 763-6441', address: '304 NW 2nd St, Okeechobee, FL 34972', contactEmail: 'permits@co.okeechobee.fl.us' },
  { name: 'Orange', website: 'https://www.orangecountyfl.net/', phone: '(407) 836-7370', address: '201 S Rosalind Ave, Orlando, FL 32801', contactEmail: 'permits@orangecountyfl.net' },
  { name: 'Osceola', website: 'https://www.osceola.org/', phone: '(407) 742-2000', address: '1 Courthouse Square, Kissimmee, FL 34741', contactEmail: 'permits@osceola.org' },
  { name: 'Palm Beach', website: 'https://www.pbcgov.org/', phone: '(561) 233-5000', address: '301 N Olive Ave, West Palm Beach, FL 33401', contactEmail: 'permits@pbcgov.org' },
  { name: 'Pasco', website: 'https://www.pascocountyfl.net/', phone: '(727) 847-8110', address: '8731 Citizens Dr, New Port Richey, FL 34654', contactEmail: 'permits@pascocountyfl.net' },
  { name: 'Pinellas', website: 'https://www.pinellascounty.org/', phone: '(727) 464-3000', address: '315 Court St, Clearwater, FL 33756', contactEmail: 'permits@pinellascounty.org' },
  { name: 'Polk', website: 'https://www.polk-county.net/', phone: '(863) 534-6000', address: '330 W Church St, Bartow, FL 33830', contactEmail: 'permits@polk-county.net' },
  { name: 'Putnam', website: 'https://www.putnam-fl.com/', phone: '(386) 329-0200', address: '2509 Crill Ave, Palatka, FL 32177', contactEmail: 'permits@putnam-fl.com' },
  { name: 'Santa Rosa', website: 'https://www.santarosa.fl.gov/', phone: '(850) 981-7000', address: '6495 Caroline St, Milton, FL 32570', contactEmail: 'permits@santarosa.fl.gov' },
  { name: 'Sarasota', website: 'https://www.scgov.net/', phone: '(941) 861-5000', address: '1660 Ringling Blvd, Sarasota, FL 34236', contactEmail: 'permits@scgov.net' },
  { name: 'Seminole', website: 'https://www.seminolecountyfl.gov/', phone: '(407) 665-7300', address: '1101 E 1st St, Sanford, FL 32771', contactEmail: 'permits@seminolecountyfl.gov' },
  { name: 'St. Johns', website: 'https://www.sjcfl.us/', phone: '(904) 209-0750', address: '500 San Sebastian View, St Augustine, FL 32084', contactEmail: 'permits@sjcfl.us' },
  { name: 'St. Lucie', website: 'https://www.stlucieco.gov/', phone: '(772) 462-1000', address: '2300 Virginia Ave, Fort Pierce, FL 34982', contactEmail: 'permits@stlucieco.gov' },
  { name: 'Sumter', website: 'https://www.sumtercountyfl.gov/', phone: '(352) 689-4400', address: '910 N Main St, Bushnell, FL 33513', contactEmail: 'permits@sumtercountyfl.gov' },
  { name: 'Suwannee', website: 'https://www.suwanneecounty.org/', phone: '(386) 362-3204', address: '200 Ohio Ave S, Live Oak, FL 32064', contactEmail: 'permits@suwanneecounty.org' },
  { name: 'Taylor', website: 'https://www.taylorcountygov.com/', phone: '(850) 838-3500', address: '201 E Green St, Perry, FL 32347', contactEmail: 'permits@taylorcountygov.com' },
  { name: 'Union', website: 'https://www.unioncountyfl.gov/', phone: '(386) 496-4251', address: '55 W Main St, Lake Butler, FL 32054', contactEmail: 'permits@unioncountyfl.gov' },
  { name: 'Volusia', website: 'https://www.volusia.org/', phone: '(386) 248-8000', address: '123 W Indiana Ave, DeLand, FL 32720', contactEmail: 'permits@volusia.org' },
  { name: 'Wakulla', website: 'https://www.mywakulla.com/', phone: '(850) 926-0919', address: '29 Arran Rd, Crawfordville, FL 32327', contactEmail: 'permits@mywakulla.com' },
  { name: 'Walton', website: 'https://www.co.walton.fl.us/', phone: '(850) 892-8115', address: '571 US Hwy 90, DeFuniak Springs, FL 32433', contactEmail: 'permits@co.walton.fl.us' },
  { name: 'Washington', website: 'https://www.washingtonfl.com/', phone: '(850) 638-6200', address: '1331 South Blvd, Chipley, FL 32428', contactEmail: 'permits@washingtonfl.com' }
];

const comprehensiveChecklists = [
  // Building & Construction
  {
    name: 'Building Permit Application',
    description: 'Complete building permit application form with all required information including project details, contractor information, and owner details',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
    estimatedCost: 150,
    processingTime: 2,
    order: 1
  },
  {
    name: 'Site Plan & Survey',
    description: 'Professional survey showing property boundaries, building location, setbacks, easements, and existing structures',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
    estimatedCost: 300,
    processingTime: 3,
    order: 2
  },
  {
    name: 'Construction Plans & Specifications',
    description: 'Detailed architectural, structural, mechanical, electrical, and plumbing plans stamped by licensed professionals',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
    estimatedCost: 800,
    processingTime: 7,
    order: 3
  },
  {
    name: 'Structural Calculations',
    description: 'Engineer-stamped structural calculations, foundation design, and load calculations',
    category: 'required',
    projectTypes: ['commercial', 'industrial', 'new_construction'],
    estimatedCost: 1200,
    processingTime: 10,
    order: 4
  },
  {
    name: 'Florida Building Code Compliance',
    description: 'Documentation showing compliance with current Florida Building Code requirements',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
    estimatedCost: 400,
    processingTime: 5,
    order: 5
  },
  {
    name: 'Energy Code Compliance',
    description: 'Florida Energy Code compliance documentation including thermal envelope and HVAC calculations',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'new_construction'],
    estimatedCost: 350,
    processingTime: 4,
    order: 6
  },
  {
    name: 'Fire Safety & Life Safety Review',
    description: 'Fire department review and approval including sprinkler systems, fire alarms, and egress plans',
    category: 'required',
    projectTypes: ['commercial', 'industrial'],
    estimatedCost: 450,
    processingTime: 5,
    order: 7
  },
  {
    name: 'Accessibility Compliance (ADA)',
    description: 'Americans with Disabilities Act compliance documentation for commercial projects',
    category: 'required',
    projectTypes: ['commercial', 'industrial'],
    estimatedCost: 300,
    processingTime: 4,
    order: 8
  },
  
  // Environmental & Land Use
  {
    name: 'Environmental Impact Assessment',
    description: 'Comprehensive environmental impact study for large development projects',
    category: 'conditional',
    projectTypes: ['commercial', 'industrial', 'new_construction'],
    estimatedCost: 2500,
    processingTime: 21,
    order: 9
  },
  {
    name: 'Traffic Impact Study',
    description: 'Traffic impact analysis including traffic counts, capacity analysis, and mitigation measures',
    category: 'conditional',
    projectTypes: ['commercial', 'industrial'],
    estimatedCost: 1800,
    processingTime: 14,
    order: 10
  },
  {
    name: 'Flood Zone Determination',
    description: 'FEMA flood zone determination, elevation certificates, and flood compliance documentation',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'new_construction'],
    estimatedCost: 250,
    processingTime: 3,
    order: 11
  },
  {
    name: 'Wetland Delineation',
    description: 'Professional wetland delineation study and mitigation plan if applicable',
    category: 'conditional',
    projectTypes: ['commercial', 'industrial', 'new_construction'],
    estimatedCost: 1500,
    processingTime: 10,
    order: 12
  },
  {
    name: 'Archeological Survey',
    description: 'Cultural resource assessment for projects in historically significant areas',
    category: 'conditional',
    projectTypes: ['new_construction'],
    estimatedCost: 1200,
    processingTime: 14,
    order: 13
  },
  
  // Florida-Specific Requirements
  {
    name: 'Hurricane Impact Resistance',
    description: 'Florida Building Code hurricane impact compliance including window and door testing',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'renovation', 'new_construction'],
    estimatedCost: 600,
    processingTime: 5,
    order: 14
  },
  {
    name: 'Wind Load Calculations',
    description: 'Wind load calculations for structures in high wind zones',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'new_construction'],
    estimatedCost: 400,
    processingTime: 4,
    order: 15
  },
  {
    name: 'Seismic Design (if applicable)',
    description: 'Seismic design requirements for structures in seismic zones',
    category: 'conditional',
    projectTypes: ['commercial', 'industrial'],
    estimatedCost: 800,
    processingTime: 7,
    order: 16
  },
  
  // Utility & Infrastructure
  {
    name: 'Water & Sewer Connection',
    description: 'Water and sewer connection permits and capacity analysis',
    category: 'required',
    projectTypes: ['residential', 'commercial', 'new_construction'],
    estimatedCost: 300,
    processingTime: 3,
    order: 17
  },
  {
    name: 'Septic System Permit',
    description: 'Department of Health septic system permit and design for rural properties',
    category: 'conditional',
    projectTypes: ['residential', 'new_construction'],
    estimatedCost: 450,
    processingTime: 7,
    order: 18
  },
  {
    name: 'Well Permit',
    description: 'Water well construction permit and water quality testing',
    category: 'conditional',
    projectTypes: ['residential', 'commercial', 'new_construction'],
    estimatedCost: 300,
    processingTime: 5,
    order: 19
  },
  {
    name: 'Stormwater Management',
    description: 'Stormwater management plan and drainage design',
    category: 'required',
    projectTypes: ['commercial', 'industrial', 'new_construction'],
    estimatedCost: 600,
    processingTime: 7,
    order: 20
  },
  
  // Additional Requirements
  {
    name: 'Landscape & Irrigation Plan',
    description: 'Landscaping plan including native plants and irrigation system design',
    category: 'optional',
    projectTypes: ['residential', 'commercial', 'new_construction'],
    estimatedCost: 200,
    processingTime: 3,
    order: 21
  },
  {
    name: 'Signage Permit',
    description: 'Commercial signage permit and design review',
    category: 'conditional',
    projectTypes: ['commercial'],
    estimatedCost: 150,
    processingTime: 2,
    order: 22
  },
  {
    name: 'Demolition Permit',
    description: 'Demolition permit for existing structures',
    category: 'conditional',
    projectTypes: ['renovation'],
    estimatedCost: 100,
    processingTime: 2,
    order: 23
  },
  {
    name: 'Temporary Construction Permit',
    description: 'Temporary construction facilities and staging area permit',
    category: 'conditional',
    projectTypes: ['new_construction'],
    estimatedCost: 75,
    processingTime: 1,
    order: 24
  }
];

const seedAll = async () => {
  try {
    console.log('🚀 Starting comprehensive PMS Tracker seeding...\n');

    // Step 1: Create Admin User
    console.log('👤 Creating admin user...');
    const existingAdmin = await User.findOne({ where: { email: 'admin@pms-tracker.com' } });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('Admin@2024!', 12);
      const adminUser = await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@pms-tracker.com',
        password: hashedPassword,
        phone: '(555) 999-0000',
        company: 'PMS Tracker System Admin',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: Admin@2024!`);
    }

    // Step 2: Create Demo User
    console.log('\n👤 Creating demo user...');
    const existingDemo = await User.findOne({ where: { email: 'demo@example.com' } });
    if (existingDemo) {
      console.log('✅ Demo user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('demo123', 12);
      const demoUser = await User.create({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        password: hashedPassword,
        phone: '(555) 123-4567',
        company: 'Demo Construction Co.',
        role: 'user',
        isActive: true
      });
      console.log('✅ Demo user created successfully');
      console.log(`   Email: ${demoUser.email}`);
      console.log(`   Password: demo123`);
    }

    // Step 3: Seed Florida Counties
    console.log('\n🗺️  Seeding Florida counties...');
    
    // Remove existing Florida counties to avoid duplicates
    await County.destroy({ where: { state: 'FL' } });
    console.log('   Removed existing Florida counties');

    const createdCounties = [];
    for (const countyData of floridaCounties) {
      // Generate realistic processing times based on county size and complexity
      let baseProcessingTime;
      if (['Miami-Dade', 'Broward', 'Hillsborough', 'Orange', 'Palm Beach'].includes(countyData.name)) {
        baseProcessingTime = Math.floor(Math.random() * 15) + 35; // 35-50 days for large counties
      } else if (['Pinellas', 'Duval', 'Lee', 'Sarasota', 'Collier'].includes(countyData.name)) {
        baseProcessingTime = Math.floor(Math.random() * 10) + 25; // 25-35 days for medium counties
      } else {
        baseProcessingTime = Math.floor(Math.random() * 8) + 20; // 20-28 days for smaller counties
      }

      const county = await County.create({
        name: countyData.name,
        state: 'FL',
        stateFull: 'Florida',
        website: countyData.website,
        phone: countyData.phone,
        address: countyData.address,
        contactEmail: countyData.contactEmail,
        processingTime: baseProcessingTime,
        timezone: 'America/New_York',
        isActive: true
      });

      createdCounties.push(county);
      console.log(`   ✅ ${countyData.name} County (Processing: ${baseProcessingTime} days)`);
    }

    console.log(`\n✅ Created ${createdCounties.length} Florida counties`);

    // Step 4: Create Comprehensive Checklists
    console.log('\n📋 Creating comprehensive permit checklists...');
    let totalChecklists = 0;

    for (const county of createdCounties) {
      for (const checklistData of comprehensiveChecklists) {
        // Add some county-specific variations
        let adjustedCost = checklistData.estimatedCost;
        let adjustedTime = checklistData.processingTime;
        
        // Adjust costs based on county (higher in urban areas)
        if (['Miami-Dade', 'Broward', 'Hillsborough', 'Orange'].includes(county.name)) {
          adjustedCost = Math.round(checklistData.estimatedCost * 1.2);
        } else if (['Collier', 'Palm Beach', 'Sarasota'].includes(county.name)) {
          adjustedCost = Math.round(checklistData.estimatedCost * 1.1);
        }
        
        // Adjust processing times based on county workload
        if (['Miami-Dade', 'Broward'].includes(county.name)) {
          adjustedTime = Math.round(checklistData.processingTime * 1.3);
        }

        await Checklist.create({
          ...checklistData,
          estimatedCost: adjustedCost,
          processingTime: adjustedTime,
          countyId: county.id
        });
        totalChecklists++;
      }
    }

    console.log(`✅ Created ${totalChecklists} comprehensive checklists for Florida counties`);

    // Step 5: Summary
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: 2 (1 admin, 1 demo)`);
    console.log(`   🗺️  Counties: ${createdCounties.length} Florida counties`);
    console.log(`   📋 Checklists: ${totalChecklists} permit requirements`);
    console.log('\n🔑 Admin Login:');
    console.log(`   Email: admin@pms-tracker.com`);
    console.log(`   Password: Admin@2024!`);
    console.log('\n🔑 Demo Login:');
    console.log(`   Email: demo@example.com`);
    console.log(`   Password: demo123`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedAll();
}

module.exports = seedAll;
