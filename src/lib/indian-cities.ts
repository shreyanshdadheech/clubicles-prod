// Comprehensive list of Indian cities for dropdowns and search
export const INDIAN_CITIES = [
  // Major Metros
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
  
  // Tier 1 Cities
  'Ahmedabad', 'Gurgaon', 'Noida', 'Jaipur', 'Kochi', 'Indore', 'Coimbatore', 
  'Chandigarh', 'Lucknow', 'Bhopal', 'Visakhapatnam', 'Nagpur', 'Surat',
  
  // Tier 2 Cities
  'Vadodara', 'Thiruvananthapuram', 'Mysuru', 'Mangaluru', 'Nashik', 'Varanasi',
  'Bhilwara', 'Goa', 'Agra', 'Allahabad', 'Amritsar', 'Aurangabad', 'Bhubaneswar',
  'Dehradun', 'Faridabad', 'Ghaziabad', 'Guwahati', 'Hubli', 'Jabalpur', 'Jamshedpur',
  'Jodhpur', 'Kanpur', 'Kolhapur', 'Kozhikode', 'Ludhiana', 'Madurai', 'Mangalore',
  'Meerut', 'Navi Mumbai', 'Patna', 'Pimpri-Chinchwad', 'Raipur', 'Rajkot', 'Ranchi',
  'Salem', 'Srinagar', 'Thane', 'Tiruchirappalli', 'Udaipur', 'Vijayawada', 'Warangal',
  
  // Additional Cities
  'Aligarh', 'Bareilly', 'Bhavnagar', 'Bhubaneswar', 'Bikaner', 'Bokaro', 'Chandrapur',
  'Cuttack', 'Dhanbad', 'Durgapur', 'Erode', 'Firozabad', 'Gandhinagar', 'Gaya',
  'Gorakhpur', 'Gulbarga', 'Guntur', 'Haldia', 'Hosur', 'Hubli-Dharwad', 'Imphal',
  'Jalgaon', 'Jammu', 'Jhansi', 'Jorhat', 'Kadapa', 'Kakinada', 'Kannur', 'Karnal',
  'Kochi', 'Kolhapur', 'Kollam', 'Kozhikode', 'Kurnool', 'Latur', 'Loni', 'Madurai',
  'Malappuram', 'Malegaon', 'Mangalore', 'Mathura', 'Mau', 'Mira-Bhayandar', 'Moradabad',
  'Mysore', 'Nanded', 'Nashik', 'Nellore', 'Nizamabad', 'Noida', 'Ongole', 'Parbhani',
  'Pimpri-Chinchwad', 'Puducherry', 'Purnia', 'Raipur', 'Rajkot', 'Rajpur Sonarpur',
  'Ramagundam', 'Rampur', 'Ranchi', 'Rourkela', 'Sagar', 'Saharanpur', 'Salem',
  'Sambalpur', 'Sangli', 'Shimla', 'Siliguri', 'Solapur', 'Srinagar', 'Surat',
  'Thanjavur', 'Thiruvananthapuram', 'Thrissur', 'Tirunelveli', 'Tiruppur', 'Tumkur',
  'Udaipur', 'Ujjain', 'Ulhasnagar', 'Vadodara', 'Varanasi', 'Vasai-Virar', 'Vijayawada',
  'Visakhapatnam', 'Warangal', 'Yamunanagar'
]

// Popular cities for hero section (prioritized)
export const POPULAR_CITIES = [
  'Mumbai', 'Pune', 'Bengaluru', 'Varanasi', 'Bhilwara', 'Goa', 'Delhi', 'Hyderabad', 
  'Chennai', 'Ahmedabad', 'Kolkata', 'Gurgaon', 'Noida', 'Jaipur', 'Kochi', 'Indore'
]

// State-wise city groups for better organization
export const CITIES_BY_STATE = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur', 'Nanded', 'Sangli', 'Solapur', 'Amravati', 'Latur', 'Malegaon', 'Jalgaon', 'Akola', 'Loni', 'Ahmadnagar', 'Dhule', 'Ichalkaranji', 'Parbhani', 'Jalna', 'Bhusawal', 'Panvel', 'Ulhasnagar', 'Sangli-Miraj & Kupwad', 'Malegaon', 'Jalgaon', 'Akola', 'Loni', 'Ahmadnagar', 'Dhule', 'Ichalkaranji', 'Parbhani', 'Jalna', 'Bhusawal', 'Panvel', 'Ulhasnagar', 'Sangli-Miraj & Kupwad'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli-Dharwad', 'Mangaluru', 'Belagavi', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag-Betigeri', 'Udupi', 'Robertson Pet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Udupi', 'Robertson Pet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukkudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Cuddalore', 'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 'Vaniyambadi', 'Ambur', 'Nagapattinam', 'Gudiyatham', 'Pudukkottai', 'Vaniyambadi', 'Ambur', 'Nagapattinam'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Nadiad', 'Anand', 'Gandhinagar', 'Morbi', 'Bharuch', 'Vapi', 'Navsari', 'Veraval', 'Bharuch', 'Vapi', 'Navsari', 'Veraval'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Ghaziabad', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Shahjahanpur', 'Rampur', 'Modinagar', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich'],
  'West Bengal': ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bangaon', 'Cooch Behar', 'Diamond Harbour', 'Islampur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bangaon', 'Cooch Behar', 'Diamond Harbour', 'Islampur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Dungarpur', 'Sawai Madhopur', 'Churu', 'Jhunjhunu', 'Baran', 'Bundi', 'Sirohi', 'Pratapgarh', 'Rajsamand', 'Banswara', 'Dholpur', 'Jalore', 'Jhalawar', 'Karauli', 'Nagaur', 'Sawai Madhopur', 'Churu', 'Jhunjhunu', 'Baran', 'Bundi', 'Sirohi', 'Pratapgarh', 'Rajsamand', 'Banswara', 'Dholpur', 'Jalore', 'Jhalawar', 'Karauli', 'Nagaur'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kadapa', 'Anantapur', 'Chittoor', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Chilakaluripet', 'Proddatur', 'Kadiri', 'Srikakulam', 'Anakapalle', 'Kavali', 'Tadipatri', 'Narasaraopet', 'Srikakulam', 'Anakapalle', 'Kavali', 'Tadipatri', 'Narasaraopet'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal', 'Kamareddy', 'Kothagudem', 'Bodhan', 'Palakurthi', 'Vikarabad', 'Jangaon', 'Tandur', 'Sangareddy', 'Wanaparthy', 'Mahabubabad', 'Yadadri Bhuvanagiri', 'Siddipet', 'Jangaon', 'Tandur', 'Sangareddy', 'Wanaparthy', 'Mahabubabad', 'Yadadri Bhuvanagiri', 'Siddipet'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Malappuram', 'Kannur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kollam', 'Palakkad', 'Alappuzha'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Katni', 'Guna', 'Damoh', 'Chhindwara', 'Sehore', 'Seoni', 'Datia', 'Shivpuri', 'Vidisha', 'Pithampur', 'Mandsaur', 'Neemuch', 'Hoshangabad', 'Itarsi', 'Sarni', 'Sehore', 'Seoni', 'Datia', 'Shivpuri', 'Vidisha', 'Pithampur', 'Mandsaur', 'Neemuch', 'Hoshangabad', 'Itarsi', 'Sarni'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal', 'Fatehabad', 'Gohana', 'Tohana', 'Narnaul', 'Hansi', 'Bawal', 'Narwana', 'Mandi Dabwali', 'Charkhi Dadri', 'Shahbad', 'Pehowa', 'Samalkha', 'Hodal', 'Sohna', 'Mandi Dabwali', 'Charkhi Dadri', 'Shahbad', 'Pehowa', 'Samalkha', 'Hodal', 'Sohna'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Zirakpur', 'Kot Kapura', 'Faridkot', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Zirakpur', 'Kot Kapura', 'Faridkot'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Baleshwar', 'Bhadrak', 'Baripada', 'Balasore', 'Jharsuguda', 'Bhadrak', 'Baripada', 'Balasore', 'Jharsuguda'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Sivasagar', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Goalpara', 'Barpeta', 'Lanka', 'Mangaldoi', 'Nalbari', 'Rangia', 'Margherita', 'Mangaldoi', 'Nalbari', 'Rangia', 'Margherita'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medini Nagar', 'Chirkunda', 'Gumia', 'Dumka', 'Madhupur', 'Chas', 'Ghatshila', 'Pakaur', 'Simdega', 'Musabani', 'Mihijam', 'Patratu', 'Lohardaga', 'Tenu', 'Chirkunda', 'Gumia', 'Dumka', 'Madhupur', 'Chas', 'Ghatshila', 'Pakaur', 'Simdega', 'Musabani', 'Mihijam', 'Patratu', 'Lohardaga', 'Tenu'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg', 'Raurkela', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg', 'Raurkela'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Ramnagar', 'Pithoragarh', 'Manglaur', 'Mussoorie', 'Haldwani', 'Kotdwar', 'Bazpur', 'Champawat', 'Laksar', 'Lalkuan', 'Sitarganj', 'Srinagar', 'Tanakpur', 'Manglaur', 'Mussoorie', 'Haldwani', 'Kotdwar', 'Bazpur', 'Champawat', 'Laksar', 'Lalkuan', 'Sitarganj', 'Srinagar', 'Tanakpur'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Baddi', 'Nahan', 'Mandi', 'Palampur', 'Sundarnagar', 'Chamba', 'Una', 'Bilaspur', 'Kangra', 'Kullu', 'Hamirpur', 'Nalagarh', 'Paonta Sahib', 'Sundarnagar', 'Chamba', 'Una', 'Bilaspur', 'Kangra', 'Kullu', 'Hamirpur', 'Nalagarh', 'Paonta Sahib'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Baramulla', 'Anantnag', 'Sopore', 'Kathua', 'Udhampur', 'Srinagar', 'Jammu', 'Baramulla', 'Anantnag', 'Sopore', 'Kathua', 'Udhampur'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Mormugao', 'Curchorem', 'Sanquelim', 'Bicholim', 'Valpoi', 'Canacona', 'Quepem', 'Sanguem', 'Dharbandora', 'Pernem', 'Tiswadi', 'Bardez', 'Salcete', 'Mormugao', 'Ponda', 'Sanguem', 'Dharbandora', 'Pernem', 'Tiswadi', 'Bardez', 'Salcete', 'Mormugao', 'Ponda', 'Sanguem', 'Dharbandora', 'Pernem', 'Tiswadi', 'Bardez', 'Salcete']
}

// Utility functions
export const getCitiesByState = (state: string): string[] => {
  return CITIES_BY_STATE[state as keyof typeof CITIES_BY_STATE] || []
}

export const getAllCities = (): string[] => {
  // Remove duplicates and return unique cities
  return [...new Set(INDIAN_CITIES)]
}

export const getPopularCities = (): string[] => {
  return POPULAR_CITIES
}

export const searchCities = (query: string): string[] => {
  if (!query.trim()) return INDIAN_CITIES
  return INDIAN_CITIES.filter(city => 
    city.toLowerCase().includes(query.toLowerCase())
  )
}
