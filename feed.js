import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Initialize Supabase client
const supabaseUrl = 'https://zzklxfoxcrnyjkllhrlr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyODk5OSwiZXhwIjoyMDczNDA0OTk5fQ.yDyfeAvCIxKSLD83NOtJfTH5-NxrcRPYMZZM7sOfVB0'; // Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const CONFIG = {
  USERS_COUNT: 100,
  ADMINS_COUNT: 5,
  SPACE_OWNERS_COUNT: 25,
  SPACES_PER_OWNER: 2, // Average spaces per owner
  BOOKINGS_COUNT: 200,
  REVIEWS_COUNT: 150,
  TAX_CONFIGS_COUNT: 3,
  INDIAN_CITIES: [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 
    'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad'
  ],
  AMENITIES: [
    'WiFi', 'Air Conditioning', 'Power Backup', 'Parking', 'Coffee/Tea',
    'Printer', 'Projector', 'Whiteboard', 'Reception', '24/7 Access',
    'Security', 'Cleaning Service', 'Phone Booth', 'Meeting Rooms',
    'Kitchen', 'Lounge Area', 'CCTV', 'Lift', 'Washroom', 'Water Cooler'
  ],
  PROFESSIONAL_ROLES: [
    'violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'grey', 'white', 'black'
  ],
  BUSINESS_TYPES: [
    'Co-working Space', 'Business Center', 'Meeting Rooms', 'Event Space',
    'Training Center', 'Shared Office', 'Conference Hall', 'Workshop Space'
  ]
};

// Utility functions
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomChoices = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateIndianPincode = () => {
  return faker.string.numeric(6);
};

const generateGSTNumber = () => {
  const stateCode = faker.string.numeric(2);
  const panLike = faker.string.alpha({ length: 5, casing: 'upper' }) + faker.string.numeric(4);
  const entityCode = faker.string.alpha({ length: 1, casing: 'upper' });
  const checkDigit = faker.string.alphanumeric({ length: 1, casing: 'upper' });
  return `${stateCode}${panLike}${entityCode}Z${checkDigit}`;
};

const generatePAN = () => {
  return faker.string.alpha({ length: 5, casing: 'upper' }) + 
         faker.string.numeric(4) + 
         faker.string.alpha({ length: 1, casing: 'upper' });
};

const generateIFSC = () => {
  return faker.string.alpha({ length: 4, casing: 'upper' }) + faker.string.numeric(7);
};

const generateUPIId = () => {
  return `${faker.internet.userName()}@${randomChoice(['paytm', 'phonepe', 'googlepay', 'upi'])}`;
};

// Main population function
async function populateDatabase() {
  console.log('🚀 Starting database population...');
  
  try {
    // Step 1: Create admins first (they need to be referenced)
    console.log('👑 Creating admins...');
    const admins = await createAdmins();
    
    // Step 2: Create tax configurations
    console.log('💰 Creating tax configurations...');
    const taxConfigs = await createTaxConfigurations(admins);
    
    // Step 3: Create regular users
    console.log('👥 Creating users...');
    const users = await createUsers();
    
    // Step 4: Create space owners
    console.log('🏢 Creating space owners...');
    const spaceOwners = await createSpaceOwners();
    
    // Step 5: Create business info for space owners
    console.log('📋 Creating business information...');
    const businessInfos = await createBusinessInfo(spaceOwners, admins);
    
    // Step 6: Create payment info for space owners
    console.log('💳 Creating payment information...');
    await createPaymentInfo(spaceOwners);
    
    // Step 7: Create spaces
    console.log('🏠 Creating spaces...');
    const spaces = await createSpaces(businessInfos);
    
    // Step 8: Create bookings
    console.log('📅 Creating bookings...');
    const bookings = await createBookings(users, spaces);
    
    // Step 9: Create booking payments
    console.log('💸 Creating booking payments...');
    await createBookingPayments(bookings);
    
    // Step 10: Create booking taxes
    console.log('🧾 Creating booking taxes...');
    await createBookingTaxes(bookings, taxConfigs);
    
    // Step 11: Create reviews
    console.log('⭐ Creating reviews...');
    await createReviews(users, spaces, bookings);
    
    // Step 12: Create business balances
    console.log('💰 Creating business balances...');
    await createBusinessBalances(businessInfos);
    
    // Step 13: Create some space owner payments
    console.log('💵 Creating space owner payments...');
    await createSpaceOwnerPayments(businessInfos, admins, bookings);
    
    console.log('✅ Database population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${admins.length} admins created`);
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${spaceOwners.length} space owners created`);
    console.log(`   - ${businessInfos.length} business profiles created`);
    console.log(`   - ${spaces.length} spaces created`);
    console.log(`   - ${bookings.length} bookings created`);
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
}

// Individual creation functions
async function createAdmins() {
  const admins = [];
  
  for (let i = 0; i < CONFIG.ADMINS_COUNT; i++) {
    const adminData = {
      tenant_id: faker.string.uuid(),
      auth_id: faker.string.uuid(),
      is_active: faker.datatype.boolean(0.9) // 90% active
    };
    
    const { data, error } = await supabase
      .from('admins')
      .insert(adminData)
      .select()
      .single();
    
    if (error) throw error;
    admins.push(data);
  }
  
  return admins;
}

async function createTaxConfigurations(admins) {
  const taxConfigs = [
    {
      name: 'GST',
      percentage: 18.00,
      is_enabled: true,
      applies_to: 'booking',
      description: 'Goods and Services Tax on bookings',
      created_by: randomChoice(admins).id
    },
    {
      name: 'TDS',
      percentage: 2.00,
      is_enabled: true,
      applies_to: 'owner_payout',
      description: 'Tax Deducted at Source for space owner payouts',
      created_by: randomChoice(admins).id
    },
    {
      name: 'Service Charge',
      percentage: 5.00,
      is_enabled: true,
      applies_to: 'booking',
      description: 'Platform service charge',
      created_by: randomChoice(admins).id
    }
  ];
  
  const { data, error } = await supabase
    .from('tax_configurations')
    .insert(taxConfigs)
    .select();
  
  if (error) throw error;
  return data;
}

async function createUsers() {
  const users = [];
  
  for (let i = 0; i < CONFIG.USERS_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const userData = {
      tenant_id: faker.string.uuid(),
      auth_id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      phone: '+91' + faker.string.numeric(10),
      avatar_url: faker.image.avatar(),
      city: randomChoice(CONFIG.INDIAN_CITIES),
      professional_role: randomChoice(CONFIG.PROFESSIONAL_ROLES),
      is_active: faker.datatype.boolean(0.95)
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    users.push(data);
  }
  
  return users;
}

async function createSpaceOwners() {
  const spaceOwners = [];
  
  for (let i = 0; i < CONFIG.SPACE_OWNERS_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const ownerData = {
      tenant_id: faker.string.uuid(),
      auth_id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      phone: '+91' + faker.string.numeric(10),
      avatar_url: faker.image.avatar(),
      membership_type: randomChoice(['grey', 'professional']),
      premium_plan: randomChoice(['basic', 'premium']),
      is_active: faker.datatype.boolean(0.9),
      onboarding_completed: faker.datatype.boolean(0.8),
      commission_rate: faker.number.float({ min: 5, max: 15, fractionDigits: 2 })
    };
    
    const { data, error } = await supabase
      .from('space_owners')
      .insert(ownerData)
      .select()
      .single();
    
    if (error) throw error;
    spaceOwners.push(data);
  }
  
  return spaceOwners;
}

async function createBusinessInfo(spaceOwners, admins) {
  const businessInfos = [];
  
  for (const owner of spaceOwners) {
    const city = randomChoice(CONFIG.INDIAN_CITIES);
    const businessData = {
      space_owner_id: owner.id,
      business_name: faker.company.name() + ' ' + randomChoice(CONFIG.BUSINESS_TYPES),
      business_type: randomChoice(CONFIG.BUSINESS_TYPES),
      gst_number: faker.datatype.boolean(0.8) ? generateGSTNumber() : null,
      pan_number: generatePAN(),
      business_address: faker.location.streetAddress(),
      business_city: city,
      business_state: 'Maharashtra', // Simplified for this example
      business_pincode: generateIndianPincode(),
      verification_status: randomChoice(['pending', 'verified', 'rejected']),
      verified_by: faker.datatype.boolean(0.6) ? randomChoice(admins).id : null,
      verified_at: faker.datatype.boolean(0.6) ? faker.date.recent({ days: 30 }) : null,
      rejection_reason: faker.datatype.boolean(0.1) ? 'Incomplete documentation' : null
    };
    
    const { data, error } = await supabase
      .from('space_owner_business_info')
      .insert(businessData)
      .select()
      .single();
    
    if (error) throw error;
    businessInfos.push(data);
  }
  
  return businessInfos;
}

async function createPaymentInfo(spaceOwners) {
  const paymentInfos = [];
  
  for (const owner of spaceOwners) {
    const paymentData = {
      space_owner_id: owner.id,
      bank_account_number: faker.finance.accountNumber(16),
      bank_ifsc_code: generateIFSC(),
      bank_account_holder_name: `${owner.first_name} ${owner.last_name}`,
      bank_name: randomChoice(['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank']),
      upi_id: faker.datatype.boolean(0.7) ? generateUPIId() : null
    };
    
    const { data, error } = await supabase
      .from('space_owner_payment_info')
      .insert(paymentData)
      .select()
      .single();
    
    if (error) throw error;
    paymentInfos.push(data);
  }
  
  return paymentInfos;
}

async function createSpaces(businessInfos) {
  const spaces = [];
  
  for (const business of businessInfos) {
    const spacesCount = faker.number.int({ min: 1, max: CONFIG.SPACES_PER_OWNER });
    
    for (let i = 0; i < spacesCount; i++) {
      const city = business.business_city;
      const totalSeats = faker.number.int({ min: 10, max: 100 });
      const pricePerHour = faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
      
      const spaceData = {
        business_id: business.id,
        name: faker.company.name() + ' ' + randomChoice(['Hub', 'Space', 'Center', 'Office']),
        description: faker.lorem.paragraphs(2),
        address: faker.location.streetAddress(),
        city: city,
        pincode: generateIndianPincode(),
        latitude: faker.location.latitude({ min: 8, max: 37 }), // India bounds
        longitude: faker.location.longitude({ min: 68, max: 97 }), // India bounds
        total_seats: totalSeats,
        available_seats: faker.number.int({ min: 0, max: totalSeats }),
        price_per_hour: pricePerHour,
        price_per_day: pricePerHour * 8 * 0.9, // Day rate with discount
        amenities: randomChoices(CONFIG.AMENITIES, faker.number.int({ min: 5, max: 15 })),
        images: [
          faker.image.urlLoremFlickr({ category: 'office' }),
          faker.image.urlLoremFlickr({ category: 'workspace' }),
          faker.image.urlLoremFlickr({ category: 'meeting' })
        ],
        status: randomChoice(['pending', 'approved', 'rejected', 'inactive']),
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
        operating_hours: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          open: '09:00',
          close: '18:00'
        }
      };
      
      const { data, error } = await supabase
        .from('spaces')
        .insert(spaceData)
        .select()
        .single();
      
      if (error) throw error;
      spaces.push(data);
    }
  }
  
  return spaces;
}

async function createBookings(users, spaces) {
  const bookings = [];
  const approvedSpaces = spaces.filter(s => s.status === 'approved');
  
  for (let i = 0; i < CONFIG.BOOKINGS_COUNT; i++) {
    const space = randomChoice(approvedSpaces);
    const user = randomChoice(users);
    const bookingDate = faker.date.between({ 
      from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)    // 30 days from now
    });
    
    const startHour = faker.number.int({ min: 9, max: 16 });
    const duration = faker.number.int({ min: 1, max: 6 });
    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
    const endTime = `${(startHour + duration).toString().padStart(2, '0')}:00`;
    
    const seatsBooked = faker.number.int({ min: 1, max: Math.min(10, space.total_seats) });
    const baseAmount = space.price_per_hour * duration * seatsBooked;
    const taxAmount = baseAmount * 0.18; // 18% tax
    const totalAmount = baseAmount + taxAmount;
    const platformCommission = totalAmount * 0.10; // 10% commission
    const ownerPayout = totalAmount - platformCommission;
    
    const bookingData = {
      user_id: user.id,
      space_id: space.id,
      start_time: startTime,
      end_time: endTime,
      date: bookingDate.toISOString().split('T')[0],
      seats_booked: seatsBooked,
      base_amount: parseFloat(baseAmount.toFixed(2)),
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      owner_payout: parseFloat(ownerPayout.toFixed(2)),
      platform_commission: parseFloat(platformCommission.toFixed(2)),
      status: randomChoice(['pending', 'confirmed', 'cancelled', 'completed']),
      payment_id: faker.string.alphanumeric(20),
      created_at: faker.date.recent({ days: 30 })
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (error) throw error;
    bookings.push(data);
  }
  
  return bookings;
}

async function createBookingPayments(bookings) {
  const payments = [];
  
  for (const booking of bookings) {
    const paymentData = {
      booking_id: booking.id,
      razorpay_payment_id: 'pay_' + faker.string.alphanumeric(14),
      razorpay_order_id: 'order_' + faker.string.alphanumeric(14),
      amount: booking.total_amount,
      currency: 'INR',
      status: booking.status === 'confirmed' || booking.status === 'completed' ? 'completed' : 
              booking.status === 'cancelled' ? 'failed' : 'pending',
      gateway_response: {
        payment_id: 'pay_' + faker.string.alphanumeric(14),
        amount: booking.total_amount * 100, // In paise
        currency: 'INR',
        status: 'captured',
        method: randomChoice(['card', 'upi', 'netbanking'])
      }
    };
    
    const { data, error } = await supabase
      .from('booking_payments')
      .insert(paymentData)
      .select()
      .single();
    
    if (error) throw error;
    payments.push(data);
  }
  
  return payments;
}

async function createBookingTaxes(bookings, taxConfigs) {
  const bookingTaxes = [];
  const bookingTaxConfigs = taxConfigs.filter(tc => tc.applies_to === 'booking' || tc.applies_to === 'both');
  
  for (const booking of bookings) {
    for (const taxConfig of bookingTaxConfigs) {
      const taxAmount = (booking.base_amount * taxConfig.percentage) / 100;
      
      const taxData = {
        booking_id: booking.id,
        tax_id: taxConfig.id,
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        base_amount: booking.base_amount
      };
      
      const { data, error } = await supabase
        .from('booking_taxes')
        .insert(taxData)
        .select()
        .single();
      
      if (error) throw error;
      bookingTaxes.push(data);
    }
  }
  
  return bookingTaxes;
}

async function createReviews(users, spaces, bookings) {
  const reviews = [];
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const selectedBookings = faker.helpers.arrayElements(completedBookings, CONFIG.REVIEWS_COUNT);
  
  for (const booking of selectedBookings) {
    const reviewData = {
      user_id: booking.user_id,
      space_id: booking.space_id,
      booking_id: booking.id,
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.datatype.boolean(0.7) ? faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })) : null
    };
    
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();
    
    if (error) throw error;
    reviews.push(data);
  }
  
  return reviews;
}

async function createBusinessBalances(businessInfos) {
  const balances = [];
  
  for (const business of businessInfos) {
    const totalEarned = faker.number.float({ min: 0, max: 100000, fractionDigits: 2 });
    const totalWithdrawn = faker.number.float({ min: 0, max: totalEarned * 0.8, fractionDigits: 2 });
    const pendingAmount = faker.number.float({ min: 0, max: 10000, fractionDigits: 2 });
    const currentBalance = totalEarned - totalWithdrawn;
    
    const balanceData = {
      business_id: business.id,
      current_balance: parseFloat(currentBalance.toFixed(2)),
      total_earned: parseFloat(totalEarned.toFixed(2)),
      total_withdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      pending_amount: parseFloat(pendingAmount.toFixed(2)),
      commission_deducted: parseFloat((totalWithdrawn * 0.10).toFixed(2)),
      tax_deducted: parseFloat((totalWithdrawn * 0.02).toFixed(2)),
      last_payout_date: faker.date.recent({ days: 30 })
    };
    
    const { data, error } = await supabase
      .from('business_balances')
      .insert(balanceData)
      .select()
      .single();
    
    if (error) throw error;
    balances.push(data);
  }
  
  return balances;
}

async function createSpaceOwnerPayments(businessInfos, admins, bookings) {
  const payments = [];
  const completedBookings = bookings.filter(b => b.status === 'completed');
  
  // Create some payouts for random businesses
  const selectedBusinesses = faker.helpers.arrayElements(businessInfos, Math.floor(businessInfos.length * 0.6));
  
  for (const business of selectedBusinesses) {
    const relatedBookings = completedBookings.filter(b => {
      const space = bookings.find(booking => booking.id === b.id);
      return space; // This is a simplified check
    });
    
    if (relatedBookings.length === 0) continue;
    
    const payoutBookings = faker.helpers.arrayElements(relatedBookings, Math.min(5, relatedBookings.length));
    const totalAmount = payoutBookings.reduce((sum, b) => sum + b.owner_payout, 0);
    const commissionDeducted = totalAmount * 0.10;
    const taxDeducted = totalAmount * 0.02;
    const netAmount = totalAmount - commissionDeducted - taxDeducted;
    
    const paymentData = {
      business_id: business.id,
      amount: parseFloat(totalAmount.toFixed(2)),
      payout_status: randomChoice(['pending', 'processing', 'completed', 'failed']),
      transaction_reference: faker.string.alphanumeric(20),
      payment_method: randomChoice(['bank_transfer', 'upi']),
      processed_by: randomChoice(admins).id,
      processed_at: faker.date.recent({ days: 15 }),
      booking_ids: payoutBookings.map(b => b.id),
      commission_deducted: parseFloat(commissionDeducted.toFixed(2)),
      tax_deducted: parseFloat(taxDeducted.toFixed(2)),
      net_amount: parseFloat(netAmount.toFixed(2)),
      payout_date: faker.date.recent({ days: 7 })
    };
    
    const { data, error } = await supabase
      .from('space_owner_payments')
      .insert(paymentData)
      .select()
      .single();
    
    if (error) throw error;
    payments.push(data);
  }
  
  return payments;
}

// Run the population script
populateDatabase().catch(console.error);