import axios from 'axios'
import * as cheerio from 'cheerio'

export async function scrapeLinkedInJobs(role, location = '') {
  try {
    // Default to India if no location specified
    const locationStr = location || 'India'
    const searchQuery = encodeURIComponent(`${role}`)
    const locationQuery = encodeURIComponent(locationStr)
    
    // Add specific parameters for recent jobs in India, sorted by recent posting
    const url = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=${locationQuery}&f_TPR=r604800&sortBy=DD`

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
      }
    })

    const $ = cheerio.load(data)
    const jobs = []

    // Try multiple selectors to find job listings
    const jobSelectors = [
      '.jobs-search__results-list li', 
      '.base-search-card', 
      '.job-search-card',
      '[data-job-id]'
    ]
    
    jobSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const title = $(element).find('.base-search-card__title, .job-title, h3').text().trim()
        const company = $(element).find('.base-search-card__subtitle, .company-name, h4').text().trim()
        const location = $(element).find('.job-search-card__location, .job-location, .location').text().trim()
        const postedDate = $(element).find('time, .posted-date, .job-posted-date').text().trim()
        const applyLink = $(element).find('a.base-card__full-link, a.job-title-link, a.base-card-full-link').attr('href') || '#'
        
        const salary = $(element).find('.compensation, .salary-info').text().trim()
        // Make sure salary shows as rupees for Indian jobs
        const formattedSalary = salary ? salary.replace(/\$/g, '₹') : ''
        
        if (title && company) {
          jobs.push({
            id: `linkedin-${Math.random().toString(36).substring(2, 10)}`,
            title,
            company,
            location: location || locationStr,
            postedDate: postedDate || 'Recently',
            applyLink,
            salary: formattedSalary || 'Not specified',
            platform: 'LinkedIn'
          })
        }
      })
    })

    // Try to get more jobs by looking for a JavaScript object in the page
    try {
      const scriptContent = $('script:contains("jobCardPrefetch")').html()
      if (scriptContent) {
        const jsonMatch = scriptContent.match(/(\{.*\})/)
        if (jsonMatch && jsonMatch[0]) {
          try {
            const jsonData = JSON.parse(jsonMatch[0])
            if (jsonData.included) {
              jsonData.included.forEach(item => {
                if (item.$type === 'com.linkedin.voyager.jobs.JobPosting') {
                  const title = item.title || ''
                  const company = item.companyDetails?.companyName || ''
                  const location = item.formattedLocation || locationStr
                  
                  if (title && company && jobs.length < 30) {
                    jobs.push({
                      id: `linkedin-${item.entityUrn || Math.random().toString(36).substring(2, 10)}`,
                      title,
                      company,
                      location,
                      postedDate: 'Recently',
                      applyLink: `https://www.linkedin.com/jobs/view/${item.jobPostingId || ''}`,
                      salary: item.formattedSalary || 'Not specified',
                      platform: 'LinkedIn'
                    })
                  }
                }
              })
            }
          } catch (parseError) {
            console.warn('Failed to parse LinkedIn JSON data', parseError)
          }
        }
      }
    } catch (scriptError) {
      console.warn('Error extracting LinkedIn script data', scriptError)
    }

    // Try an alternative API endpoint if we don't have enough jobs
    if (jobs.length < 30) {
      try {
        const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${searchQuery}&location=${locationQuery}&f_TPR=r604800&start=0`
        
        const apiResponse = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html',
            'Referer': url
          }
        })
        
        const $api = cheerio.load(apiResponse.data)
        
        $api('li').each((_, element) => {
          const title = $api(element).find('.base-search-card__title, h3').text().trim()
          const company = $api(element).find('.base-search-card__subtitle, h4').text().trim()
          const location = $api(element).find('.job-search-card__location, .job-location').text().trim()
          const postedDate = $api(element).find('time').text().trim()
          const applyLink = $api(element).find('a.base-card__full-link').attr('href') || '#'
          
          if (title && company) {
            jobs.push({
              id: `linkedin-api-${Math.random().toString(36).substring(2, 10)}`,
              title,
              company,
              location: location || locationStr,
              postedDate: postedDate || 'Recently',
              applyLink,
              salary: 'Not specified',
              platform: 'LinkedIn'
            })
          }
        })
      } catch (apiError) {
        console.warn('Failed to fetch LinkedIn API data', apiError)
      }
    }

    // Return only actual scraped jobs
    console.log(`Found ${jobs.length} real LinkedIn jobs`);
    return jobs;
    
  } catch (error) {
    console.error('LinkedIn scraping error:', error)
    // Return empty array instead of mock data
    return [];
  }
}