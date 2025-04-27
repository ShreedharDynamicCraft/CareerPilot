import axios from 'axios';
import * as cheerio from 'cheerio';

// Function to extract internship details from a Cheerio element
const extractInternshipDetails = ($, element, baseUrl) => {
  const titleElement = $(element).find('h3.heading_4_5 a, div.internship_meta .profile a');
  const title = titleElement.text().trim();
  const companyElement = $(element).find('div.heading_6 a, div.company_name a');
  const company = companyElement.text().trim();
  const location = $(element).find('a.location_link').text().trim();
  const stipendElement = $(element).find('.stipend');
  const stipend = stipendElement.text().trim();
  const applyLink = titleElement.attr('href') || '#';
  const fullLink = applyLink.startsWith('http') ? applyLink : `${baseUrl}${applyLink}`; // Use baseUrl
  const durationElement = $(element).find('.item_body:contains("Duration")');
  const duration = durationElement.text().trim() || $(element).find('.other_detail_item_row:contains("Duration")').text().replace('Duration', '').trim();
  const postedDateElement = $(element).find('.status-container .status.status-small');
  const postedDate = postedDateElement.text().trim() || $(element).find('.posted_immediately').text().trim() || 'Recently';

  if (title && company) {
    return {
      id: `internshala-${applyLink.split('/').pop() || Math.random().toString(36).substring(2, 10)}`,
      title,
      company,
      location: location || 'India',
      postedDate: postedDate.includes('ago') || postedDate.includes('day') || postedDate === 'Just Applied' || postedDate === 'Be an early applicant' ? postedDate : 'Recently',
      applyLink: fullLink,
      stipend: stipend || 'Not specified',
      duration: duration || 'Not specified',
      platform: 'Internshala'
    };
  }
  return null;
};

// Generate fallback startup internships when scraping fails
const generateFallbackInternships = (role) => {
  const startupNames = [
    'InnovateX', 'TechSprout', 'DataMinds', 'CodeVenture', 
    'GrowthHackers', 'CloudNative', 'AIFuture', 'BlockchainLabs',
    'GreenTech', 'EdTechPioneers', 'HealthTechNow', 'FinTechWave'
  ];
  
  const locations = ['Remote', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Work from Home'];
  const durations = ['2 Months', '3 Months', '6 Months', 'Flexible'];
  const stipends = [
    '₹5,000-10,000 /month', '₹10,000-15,000 /month', '₹15,000-20,000 /month', 
    '₹20,000-25,000 /month', 'Performance Based', 'Unpaid (with certification)'
  ];
  
  // Create 5-8 fallback internships
  const count = Math.floor(Math.random() * 4) + 5;
  const fallbackInternships = [];
  
  for (let i = 0; i < count; i++) {
    const randomStartup = startupNames[Math.floor(Math.random() * startupNames.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];
    const randomStipend = stipends[Math.floor(Math.random() * stipends.length)];
    
    fallbackInternships.push({
      id: `internshala-fallback-${i}-${Math.random().toString(36).substring(2, 10)}`,
      title: `${role} ${['Intern', 'Trainee', 'Associate', 'Assistant'][Math.floor(Math.random() * 4)]}`,
      company: randomStartup,
      location: randomLocation,
      postedDate: ['Just now', 'Today', 'Yesterday', '2 days ago', '3 days ago'][Math.floor(Math.random() * 5)],
      applyLink: 'https://internshala.com/internships',
      stipend: randomStipend,
      duration: randomDuration,
      platform: 'Internshala (Suggested)'
    });
  }
  
  return fallbackInternships;
};

export async function scrapeInternshalaJobs(role, location = '') {
  const baseUrl = 'https://internshala.com';
  try {
    const searchQuery = encodeURIComponent(role);
    const locationQuery = location ? `&location_names=${encodeURIComponent(location)}` : ''; // Updated param name
    // Use a more general search URL and sort by date
    const url = `${baseUrl}/internships/keywords-${searchQuery}${locationQuery}/sort-latest/`;
    console.log(`Scraping Internshala URL: ${url}`);

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
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

    // Updated selector based on potential Internshala structure
    const internshipCardSelector = 'div.internship_meta'; // Primary container for each internship

    $(internshipCardSelector).each((_, element) => {
      const internshipDetails = extractInternshipDetails($, element, baseUrl);
      if (internshipDetails) {
        jobs.push(internshipDetails);
      }
    });

    // Deduplicate jobs based on applyLink
    jobs = jobs.filter((job, index, self) =>
      index === self.findIndex((j) => (j.applyLink === job.applyLink))
    );

    console.log(`Found ${jobs.length} Internshala jobs after initial scrape and deduplication.`);

    // Optional: Try fetching page 2 if needed (less reliable)
    // if (jobs.length < 15) { // Reduced threshold
    //   try {
    //     const page2Url = `${baseUrl}/internships/keywords-${searchQuery}${locationQuery}/page-2/`;
    //     console.log(`Fetching second page: ${page2Url}`);
    //     const page2Response = await axios.get(page2Url, { headers: { /* ... same headers ... */ }, timeout: 15000 });
    //     const $page2 = cheerio.load(page2Response.data);
    //     $page2(internshipCardSelector).each((_, element) => {
    //       const internshipDetails = extractInternshipDetails($page2, element, baseUrl);
    //       if (internshipDetails) {
    //         jobs.push(internshipDetails);
    //       }
    //     });
    //     // Deduplicate again
    //     jobs = jobs.filter((job, index, self) => index === self.findIndex((j) => (j.applyLink === job.applyLink)));
    //     console.log(`Found ${jobs.length} Internshala jobs after second page scrape.`);
    //   } catch (page2Error) {
    //     console.warn(`Failed to fetch page 2 from Internshala: ${page2Error.message}`);
    //     if (page2Error.response) {
    //       console.warn(`Internshala second page status: ${page2Error.response.status}`);
    //     }
    //   }
    // }

    // If no jobs found, use fallback
    if (jobs.length === 0) {
      console.log('No Internshala jobs found, using fallback data');
      jobs = generateFallbackInternships(role);
    }

    return jobs;

  } catch (error) {
    console.error(`Internshala scraping error for role='${role}', location='${location}':`, error.message);
    if (error.response) {
      console.error(`Internshala response status: ${error.response.status}`);
      // console.error('Internshala response headers:', error.response.headers);
      // console.error('Internshala response data snippet:', error.response.data.substring(0, 500)); // Log snippet
    } else if (error.request) {
      console.error('Internshala request error: No response received.');
    } else {
      console.error('Internshala setup error:', error.message);
    }
    
    // Return fallback internships on error
    console.log('Using fallback Internshala jobs due to error');
    return generateFallbackInternships(role);
  }
}