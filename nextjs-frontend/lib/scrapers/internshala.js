import axios from 'axios'
import * as cheerio from 'cheerio'

export async function scrapeInternshalaJobs(role, location = '') {
  try {
    // Ensure we're using the India-specific URL format and add sorting by date
    const searchQuery = encodeURIComponent(role)
    const locationQuery = location ? `&location=${encodeURIComponent(location)}` : ''
    // Added sort by latest and internships in India
    const url = `https://internshala.com/internships/${searchQuery}-internships-in-india${locationQuery}/sort-latest`

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    })

    const $ = cheerio.load(data)
    const jobs = []

    // Try different selectors that might match internship listings
    const selectors = ['.internship_meta', '.individual_internship', '.container-fluid .internship_list']
    
    selectors.forEach(selector => {
      $(selector).each((_, element) => {
        const title = $(element).find('.heading_4_5 a, .profile, .internship-heading a').text().trim()
        const company = $(element).find('.heading_6 a, .company_name, .company-heading a').text().trim()
        const location = $(element).find('.location_link, .location, .location_text').text().trim()
        const stipend = $(element).find('.stipend, .stipend-container').text().trim()
        const applyLink = $(element).find('.heading_4_5 a, .profile a, .internship-heading a').attr('href') || '#'
        const fullLink = applyLink.startsWith('http') ? applyLink : `https://internshala.com${applyLink}`
        const duration = $(element).find('.other_detail_item_row:contains("Duration"), .duration').text().replace('Duration', '').trim()
        const postedDate = $(element).find('.posted_date_container, .posted-date').text().trim() || 'Recently'
        
        if (title && company) {
          jobs.push({
            id: `internshala-${Math.random().toString(36).substring(2, 10)}`,
            title,
            company,
            location: location || 'India',
            postedDate: postedDate.includes('ago') ? postedDate : 'Recently',
            applyLink: fullLink,
            stipend: stipend || '₹5,000 - ₹10,000 /month',
            duration: duration || '3-6 months',
            platform: 'Internshala'
          })
        }
      })
    })

    // If fewer than 30 jobs, try to fetch page 2
    if (jobs.length < 30) {
      try {
        const page2Url = `https://internshala.com/internships/${searchQuery}-internships-in-india${locationQuery}/page-2`
        const page2Response = await axios.get(page2Url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': url
          }
        })
        
        const $page2 = cheerio.load(page2Response.data)
        
        selectors.forEach(selector => {
          $page2(selector).each((_, element) => {
            const title = $page2(element).find('.heading_4_5 a, .profile, .internship-heading a').text().trim()
            const company = $page2(element).find('.heading_6 a, .company_name, .company-heading a').text().trim()
            const location = $page2(element).find('.location_link, .location, .location_text').text().trim()
            const stipend = $page2(element).find('.stipend, .stipend-container').text().trim()
            const applyLink = $page2(element).find('.heading_4_5 a, .profile a, .internship-heading a').attr('href') || '#'
            const fullLink = applyLink.startsWith('http') ? applyLink : `https://internshala.com${applyLink}`
            const duration = $page2(element).find('.other_detail_item_row:contains("Duration"), .duration').text().replace('Duration', '').trim()
            const postedDate = $page2(element).find('.posted_date_container, .posted-date').text().trim() || 'Recently'
            
            if (title && company) {
              jobs.push({
                id: `internshala-${Math.random().toString(36).substring(2, 10)}`,
                title,
                company,
                location: location || 'India',
                postedDate: postedDate.includes('ago') ? postedDate : 'Recently',
                applyLink: fullLink,
                stipend: stipend || '₹5,000 - ₹10,000 /month',
                duration: duration || '3-6 months',
                platform: 'Internshala'
              })
            }
          })
        })
      } catch (page2Error) {
        console.warn('Failed to fetch page 2 from Internshala:', page2Error.message)
      }
    }

    // Return only actual scraped jobs
    console.log(`Found ${jobs.length} real Internshala jobs`);
    return jobs;
    
  } catch (error) {
    console.error('Internshala scraping error:', error)
    // Return empty array instead of mock data
    return [];
  }
}