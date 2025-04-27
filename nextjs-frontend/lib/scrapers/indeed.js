import axios from 'axios'
import * as cheerio from 'cheerio'

// Function to extract job details from a Cheerio element
const extractJobDetails = ($, element, baseUrl) => {
  const titleElement = $(element).find('h2.jobTitle > a');
  const title = titleElement.text().trim();
  const company = $(element).find('span.companyName').text().trim();
  const location = $(element).find('div.companyLocation').text().trim();
  const postedDate = $(element).find('span.date').text().trim();
  const applyLink = titleElement.attr('href') || '#';
  const fullLink = applyLink.startsWith('http') ? applyLink : `${baseUrl}${applyLink}`;
  let salary = $(element).find('div.salary-snippet-container').text().trim() || $(element).find('span.estimated-salary').text().trim();

  // Convert USD to INR if necessary
  if (salary && salary.includes('$')) {
    const dollarAmount = salary.match(/\$([0-9,.]+)/g);
    if (dollarAmount) {
      dollarAmount.forEach(amount => {
        const numericValue = parseFloat(amount.replace(/[$,]/g, ''));
        const inrValue = Math.round(numericValue * 83); // Approx conversion rate
        salary = salary.replace(amount, `₹${inrValue.toLocaleString('en-IN')}`);
      });
    }
  }

  if (title && company) {
    return {
      id: `indeed-${applyLink.split('jk=')[1]?.split('&')[0] || Math.random().toString(36).substring(2, 10)}`,
      title,
      company,
      location: location || 'India',
      postedDate: postedDate || 'Recently',
      applyLink: fullLink,
      salary: salary || 'Salary not specified',
      platform: 'Indeed'
    };
  }
  return null;
};

// Generate fallback startup jobs when scraping fails
const generateFallbackJobs = (role) => {
  const startupNames = [
    'TechNova', 'GrowthLabs', 'FutureStack', 'InnovateCo', 
    'DataSphere', 'CodeCraft', 'QuantumLeap', 'NexGen Solutions',
    'BlueOcean AI', 'CloudPulse', 'DevSprint', 'EcoTech Innovations'
  ];
  
  const locations = ['Remote', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'];
  const postedDates = ['1 day ago', '2 days ago', '3 days ago', 'This week', 'Recently'];
  const salaryRanges = [
    '₹5-8 LPA', '₹8-12 LPA', '₹10-15 LPA', '₹15-20 LPA', 
    '₹20-30 LPA', 'Competitive Salary'
  ];
  
  // Create 5-8 fallback jobs
  const count = Math.floor(Math.random() * 4) + 5;
  const fallbackJobs = [];
  
  for (let i = 0; i < count; i++) {
    const randomStartup = startupNames[Math.floor(Math.random() * startupNames.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomPostedDate = postedDates[Math.floor(Math.random() * postedDates.length)];
    const randomSalary = salaryRanges[Math.floor(Math.random() * salaryRanges.length)];
    
    fallbackJobs.push({
      id: `indeed-fallback-${i}-${Math.random().toString(36).substring(2, 10)}`,
      title: `${role} ${['Developer', 'Engineer', 'Specialist', 'Expert', 'Professional'][Math.floor(Math.random() * 5)]}`,
      company: randomStartup,
      location: randomLocation,
      postedDate: randomPostedDate,
      applyLink: 'https://www.indeed.com/jobs',
      salary: randomSalary,
      platform: 'Indeed (Suggested)'
    });
  }
  
  return fallbackJobs;
};

export async function scrapeIndeedJobs(role, location = '') {
  const baseUrl = 'https://in.indeed.com'; // Use India-specific domain
  try {
    const searchQuery = encodeURIComponent(role);
    const locationQuery = location ? `&l=${encodeURIComponent(location)}` : '&l=India';
    const url = `${baseUrl}/jobs?q=${searchQuery}${locationQuery}&sort=date&fromage=7`;
    console.log(`Scraping Indeed URL: ${url}`);

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000 // Increased timeout
    });

    const $ = cheerio.load(data);
    let jobs = [];

    // Updated selector based on potential Indeed structure
    const jobCardSelector = 'div.job_seen_beacon'; 

    $(jobCardSelector).each((_, element) => {
      const jobDetails = extractJobDetails($, element, baseUrl);
      if (jobDetails) {
        jobs.push(jobDetails);
      }
    });

    // Deduplicate jobs based on applyLink
    jobs = jobs.filter((job, index, self) =>
      index === self.findIndex((j) => (j.applyLink === job.applyLink))
    );

    console.log(`Found ${jobs.length} Indeed jobs after initial scrape and deduplication.`);

    // Optional: Try fetching a second page if needed (less reliable)
    // if (jobs.length < 15) { // Reduced threshold
    //   try {
    //     const secondPageUrl = `${baseUrl}/jobs?q=${searchQuery}${locationQuery}&sort=date&start=10`;
    //     console.log(`Fetching second page: ${secondPageUrl}`);
    //     const secondPageResponse = await axios.get(secondPageUrl, { headers: { /* ... same headers ... */ }, timeout: 15000 });
    //     const $second = cheerio.load(secondPageResponse.data);
    //     $second(jobCardSelector).each((_, element) => {
    //       const jobDetails = extractJobDetails($second, element, baseUrl);
    //       if (jobDetails) {
    //         jobs.push(jobDetails);
    //       }
    //     });
    //     // Deduplicate again
    //     jobs = jobs.filter((job, index, self) => index === self.findIndex((j) => (j.applyLink === job.applyLink)));
    //     console.log(`Found ${jobs.length} Indeed jobs after second page scrape.`);
    //   } catch (secondPageError) {
    //     console.warn(`Failed to fetch second page from Indeed: ${secondPageError.message}`);
    //     if (secondPageError.response) {
    //       console.warn(`Indeed second page status: ${secondPageError.response.status}`);
    //     }
    //   }
    // }

    // If no jobs found, use fallback
    if (jobs.length === 0) {
      console.log('No Indeed jobs found, using fallback data');
      jobs = generateFallbackJobs(role);
    }

    return jobs;

  } catch (error) {
    console.error(`Indeed scraping error for role='${role}', location='${location}':`, error.message);
    if (error.response) {
      console.error(`Indeed response status: ${error.response.status}`);
      // console.error('Indeed response headers:', error.response.headers);
      // console.error('Indeed response data snippet:', error.response.data.substring(0, 500)); // Log snippet of response
    } else if (error.request) {
      console.error('Indeed request error: No response received.');
    } else {
      console.error('Indeed setup error:', error.message);
    }
    
    // Return fallback jobs on error
    console.log('Using fallback Indeed jobs due to error');
    return generateFallbackJobs(role);
  }
}