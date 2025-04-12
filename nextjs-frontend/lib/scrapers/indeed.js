import axios from 'axios'
import * as cheerio from 'cheerio'

export async function scrapeIndeedJobs(role, location = '') {
  try {
    const searchQuery = encodeURIComponent(role)
    // Add India-specific parameters and sort by date
    const locationQuery = location ? `&l=${encodeURIComponent(location)}` : '&l=India'
    const url = `https://www.indeed.com/jobs?q=${searchQuery}${locationQuery}&sort=date&fromage=7`

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

    // Try multiple selectors to find job cards
    const jobSelectors = ['.job_seen_beacon', '.jobsearch-ResultsList .result', '.jobCard']
    
    jobSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const title = $(element).find('.jobTitle a, .title, h2 a').text().trim()
        const company = $(element).find('.companyName, .company, .companyInfo').text().trim()
        const location = $(element).find('.companyLocation, .location').text().trim()
        const postedDate = $(element).find('.date, .datePosted').text().trim()
        const applyLink = $(element).find('.jobTitle a, h2 a').attr('href') || '#'
        const fullLink = applyLink.startsWith('http') ? applyLink : `https://www.indeed.com${applyLink}`
        
        let salary = $(element).find('.salary-snippet, .salaryText').text().trim()
        if (salary) {
          if (salary.includes('$')) {
            const dollarAmount = salary.match(/\$([0-9,.]+)/g)
            if (dollarAmount) {
              dollarAmount.forEach(amount => {
                const numericValue = parseFloat(amount.replace(/[$,]/g, ''))
                const inrValue = Math.round(numericValue * 83) 
                salary = salary.replace(amount, `₹${inrValue.toLocaleString('en-IN')}`)
              })
            }
          }
        }

        if (title && company) {
          jobs.push({
            id: `indeed-${Math.random().toString(36).substring(2, 10)}`,
            title,
            company,
            location: location || 'India',
            postedDate: postedDate || 'Recently',
            applyLink: fullLink,
            salary: salary || 'Salary not specified',
            platform: 'Indeed'
          })
        }
      })
    })

    // If fewer than 30 jobs found, try another page
    if (jobs.length < 30) {
      try {
        const secondPageUrl = `https://www.indeed.com/jobs?q=${searchQuery}${locationQuery}&sort=date&start=10`
        const secondPageResponse = await axios.get(secondPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
            'Referer': url
          }
        })
        
        const $second = cheerio.load(secondPageResponse.data)
        
        jobSelectors.forEach(selector => {
          $second(selector).each((_, element) => {
            const title = $second(element).find('.jobTitle a, .title, h2 a').text().trim()
            const company = $second(element).find('.companyName, .company').text().trim()
            const location = $second(element).find('.companyLocation, .location').text().trim()
            const postedDate = $second(element).find('.date, .datePosted').text().trim()
            const applyLink = $second(element).find('.jobTitle a, h2 a').attr('href') || '#'
            const fullLink = applyLink.startsWith('http') ? applyLink : `https://www.indeed.com${applyLink}`
            
            let salary = $second(element).find('.salary-snippet, .salaryText').text().trim()
            if (salary && salary.includes('$')) {
              const dollarAmount = salary.match(/\$([0-9,.]+)/g)
              if (dollarAmount) {
                dollarAmount.forEach(amount => {
                  const numericValue = parseFloat(amount.replace(/[$,]/g, ''))
                  const inrValue = Math.round(numericValue * 83)
                  salary = salary.replace(amount, `₹${inrValue.toLocaleString('en-IN')}`)
                })
              }
            }

            if (title && company) {
              jobs.push({
                id: `indeed-${Math.random().toString(36).substring(2, 10)}`,
                title,
                company,
                location: location || 'India',
                postedDate: postedDate || 'Recently',
                applyLink: fullLink,
                salary: salary || 'Salary not specified',
                platform: 'Indeed'
              })
            }
          })
        })
      } catch (secondPageError) {
        console.warn('Failed to fetch second page from Indeed:', secondPageError.message)
      }
    }

    // Return only actual scraped jobs, not mock data
    console.log(`Found ${jobs.length} real Indeed jobs`);
    return jobs;
    
  } catch (error) {
    console.error('Indeed scraping error:', error)
    // Return empty array instead of mock data
    return [];
  }
}