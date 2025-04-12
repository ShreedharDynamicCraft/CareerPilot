import asyncio
import json
import logging
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

import httpx
from fake_useragent import UserAgent
from bs4 import BeautifulSoup

# Configure logging with more detail for debugging
logging.basicConfig(
    level=logging.DEBUG,  # Changed to DEBUG for more detailed logs
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("job_scraper")

router = APIRouter()

# Helper functions for job scraping
async def scrape_linkedin(job_role: str, location: str, limit: int = 30) -> List[Dict]:
    """Scrape recent job listings from LinkedIn"""
    try:
        ua = UserAgent()
        user_agent = ua.random
        
        headers = {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.linkedin.com/",
            "Connection": "keep-alive"
        }
        
        # Format job role and location for the URL
        formatted_job = job_role.replace(" ", "%20")
        formatted_location = location.replace(" ", "%20").replace(",", "%2C")
        
        # LinkedIn Jobs search URL - sorting by recent with multiple options to increase chances of success
        urls = [
            f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={formatted_job}&location={formatted_location}&f_TPR=r604800&sortBy=DD&start=0",
            f"https://www.linkedin.com/jobs/search?keywords={formatted_job}&location={formatted_location}&f_TPR=r604800&sortBy=DD",
            f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={formatted_job}&location={formatted_location}&sortBy=DD&start=0"
        ]
        
        jobs = []
        
        # Try different URLs if one fails
        for url_index, url in enumerate(urls):
            logger.info(f"[LinkedIn] Attempt {url_index+1}: Scraping jobs for '{job_role}' in '{location}' using URL: {url}")
            
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(url, headers=headers)
                    
                    if response.status_code != 200:
                        logger.warning(f"[LinkedIn] URL {url_index+1} returned status code {response.status_code}")
                        # Save the response for debugging
                        with open(f"linkedin_error_{url_index}.html", "w", encoding="utf-8") as f:
                            f.write(response.text)
                        continue
                    
                    logger.debug(f"[LinkedIn] Success! Got response from URL {url_index+1}")
                    
                    # Save the raw response for debugging
                    with open(f"linkedin_response_{url_index}.html", "w", encoding="utf-8") as f:
                        f.write(response.text)
                    
                    # Use BeautifulSoup for more reliable HTML parsing
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Try multiple selectors to find job cards
                    selectors = [
                        'div.job-search-card',
                        'li.jobs-search-results__list-item',
                        'div.base-card',
                        'div.job-card',
                        'li.ember-view'
                    ]
                    
                    job_cards = []
                    for selector in selectors:
                        cards = soup.select(selector)
                        if cards:
                            logger.debug(f"[LinkedIn] Found {len(cards)} job cards using selector: {selector}")
                            job_cards = cards
                            break
                    
                    if not job_cards:
                        logger.warning(f"[LinkedIn] No job cards found with standard selectors. Saving HTML for analysis.")
                        continue
                    
                    # Try to fetch more results using pagination if initial request succeeds
                    if len(job_cards) > 0 and url_index == 0 and "seeMoreJobPostings" in url:
                        try:
                            # LinkedIn typically has pagination in increments of 25
                            pagination_url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={formatted_job}&location={formatted_location}&f_TPR=r604800&sortBy=DD&start=25"
                            logger.debug(f"[LinkedIn] Trying pagination URL: {pagination_url}")
                            
                            pagination_response = await client.get(pagination_url, headers=headers)
                            if pagination_response.status_code == 200:
                                pagination_soup = BeautifulSoup(pagination_response.text, 'html.parser')
                                more_cards = pagination_soup.select(selector)
                                if more_cards:
                                    logger.debug(f"[LinkedIn] Found {len(more_cards)} additional job cards via pagination")
                                    job_cards.extend(more_cards)
                        except Exception as e:
                            logger.warning(f"[LinkedIn] Error fetching pagination: {str(e)}")
                    
                    for i, card in enumerate(job_cards[:limit]):
                        try:
                            # Debug the card HTML
                            logger.debug(f"[LinkedIn] Processing job card {i+1}: {card.prettify()[:200]}...")
                            
                            # Extract job ID
                            job_id = card.get('data-id') or card.get('data-job-id') or card.get('data-entity-urn') or f"linkedin-{i}"
                            
                            # Extract job title
                            title_element = None
                            for title_selector in ['h3.base-search-card__title', 'h3.job-card-list__title', 'h3.base-card-entity__title', '.job-card-container__link-job-title']:
                                title_element = card.select_one(title_selector)
                                if title_element:
                                    break
                            
                            title = title_element.text.strip() if title_element else "Job Position"
                            
                            # Extract company name
                            company_element = None
                            for company_selector in ['h4.base-search-card__subtitle', 'a.job-card-container__company-name', '.job-card-container__company-name', '.base-card-entity__subtitle']:
                                company_element = card.select_one(company_selector)
                                if company_element:
                                    break
                                
                            company = company_element.text.strip() if company_element else "Company"
                            
                            # Extract location
                            location_element = None
                            for location_selector in ['span.job-search-card__location', 'span.job-card-container__metadata-item', '.job-card-container__metadata-location']:
                                location_element = card.select_one(location_selector)
                                if location_element:
                                    break
                                    
                            job_location = location_element.text.strip() if location_element else location
                            
                            # Extract job URL
                            link_element = None
                            for link_selector in ['a.base-card__full-link', 'a.job-card-list__title', 'a.job-card-container__link']:
                                link_element = card.select_one(link_selector)
                                if link_element and link_element.has_attr('href'):
                                    break
                            
                            job_url = link_element['href'] if link_element and link_element.has_attr('href') else ""
                            
                            # Extract date posted
                            date_element = card.find('time', datetime=True) or card.select_one('time') or card.select_one('.job-search-card__listdate')
                            date_posted = None
                            
                            if date_element and date_element.get('datetime'):
                                date_posted = date_element['datetime'].split('T')[0]
                            elif date_element:
                                date_text = date_element.text.strip().lower()
                                today = datetime.now()
                                
                                logger.debug(f"[LinkedIn] Date text found: '{date_text}'")
                                
                                if 'hour' in date_text or 'minute' in date_text or 'just now' in date_text:
                                    date_posted = today.strftime("%Y-%m-%d")
                                elif 'day' in date_text or 'yesterday' in date_text:
                                    if 'yesterday' in date_text:
                                        days_ago = 1
                                    else:
                                        days_match = re.search(r'(\d+)', date_text)
                                        days_ago = int(days_match.group(1)) if days_match else 1
                                    date_posted = (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")
                                elif 'week' in date_text:
                                    weeks_match = re.search(r'(\d+)', date_text)
                                    weeks_ago = int(weeks_match.group(1)) if weeks_match else 1
                                    date_posted = (today - timedelta(weeks=weeks_ago)).strftime("%Y-%m-%d")
                                else:
                                    date_posted = today.strftime("%Y-%m-%d")
                            else:
                                date_posted = datetime.now().strftime("%Y-%m-%d")
                            
                            # Create job listing with enhanced source labeling
                            job = {
                                "id": f"linkedin-{job_id}",
                                "title": title,
                                "company": company,
                                "location": job_location,
                                "date_posted": date_posted,
                                "job_url": job_url,
                                "source": "LinkedIn",
                                "source_label": "LinkedIn Job",
                                "source_icon": "linkedin",
                                "description": f"This job for {title} at {company} was recently posted on LinkedIn. Click to view the complete description and apply."
                            }
                            jobs.append(job)
                            logger.debug(f"[LinkedIn] Successfully parsed job: {title} at {company}")
                        except Exception as e:
                            logger.error(f"[LinkedIn] Error parsing job card {i+1}: {str(e)}")
                    
                    if jobs:
                        logger.info(f"[LinkedIn] Found {len(jobs)} jobs from URL attempt {url_index+1}")
                        # If we found jobs, we can break out of the URL loop
                        break
                        
            except Exception as e:
                logger.error(f"[LinkedIn] Error with URL {url_index+1}: {str(e)}")
        
        logger.info(f"[LinkedIn] Found {len(jobs)} jobs total")
        return jobs
    except Exception as e:
        logger.exception(f"[LinkedIn] Scraping error: {str(e)}")
        return []

async def scrape_indeed(job_role: str, location: str, limit: int = 30) -> List[Dict]:
    """Scrape recent job listings from Indeed"""
    try:
        ua = UserAgent()
        user_agent = ua.random
        
        headers = {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.google.com/",
            "Connection": "keep-alive"
        }
        
        # Format job role and location for the URL
        formatted_job = job_role.replace(" ", "+")
        formatted_location = location.replace(" ", "+").replace(",", "%2C")
        
        # Indeed Jobs search URLs with different parameters to increase chances of success
        urls = [
            f"https://www.indeed.com/jobs?q={formatted_job}&l={formatted_location}&fromage=7&sort=date",
            f"https://www.indeed.com/jobs?q={formatted_job}&l={formatted_location}&fromage=3&sort=date",
            f"https://www.indeed.com/jobs?q={formatted_job}&l={formatted_location}&sort=date"
        ]
        
        jobs = []
        
        # Try different URLs if one fails
        for url_index, url in enumerate(urls):
            logger.info(f"[Indeed] Attempt {url_index+1}: Scraping jobs for '{job_role}' in '{location}' using URL: {url}")
            
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(url, headers=headers)
                    
                    if response.status_code != 200:
                        logger.warning(f"[Indeed] URL {url_index+1} returned status code {response.status_code}")
                        # Save the response for debugging
                        with open(f"indeed_error_{url_index}.html", "w", encoding="utf-8") as f:
                            f.write(response.text)
                        continue
                    
                    logger.debug(f"[Indeed] Success! Got response from URL {url_index+1}")
                    
                    # Save the raw response for debugging
                    with open(f"indeed_response_{url_index}.html", "w", encoding="utf-8") as f:
                        f.write(response.text)
                    
                    # Use BeautifulSoup for better parsing
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Try multiple selectors for job cards
                    selectors = [
                        '[class*="job_seen_beacon"]', 
                        '[class*="tapItem"]', 
                        '[data-testid="jobListing"]',
                        'div.job_seen_beacon',
                        'div.slider_item',
                        'div.cardOutline'
                    ]
                    
                    job_cards = []
                    for selector in selectors:
                        cards = soup.select(selector)
                        if cards:
                            logger.debug(f"[Indeed] Found {len(cards)} job cards using selector: {selector}")
                            job_cards = cards
                            break
                    
                    if not job_cards:
                        logger.warning(f"[Indeed] No job cards found with standard selectors. Saving HTML for analysis.")
                        continue
                    
                    # Try to fetch more results using pagination if initial request succeeds
                    if len(job_cards) > 0 and url_index == 0:
                        try:
                            # Indeed typically uses a start parameter for pagination
                            base_url = url.split('?')[0]
                            params = dict(param.split('=') for param in url.split('?')[1].split('&'))
                            
                            # Try to get the second page of results (typically starts at 10)
                            params['start'] = '10'
                            pagination_url = f"{base_url}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
                            
                            logger.debug(f"[Indeed] Trying pagination URL: {pagination_url}")
                            
                            pagination_response = await client.get(pagination_url, headers=headers)
                            if pagination_response.status_code == 200:
                                pagination_soup = BeautifulSoup(pagination_response.text, 'html.parser')
                                more_cards = []
                                
                                for selector in selectors:
                                    more_cards = pagination_soup.select(selector)
                                    if more_cards:
                                        break
                                        
                                if more_cards:
                                    logger.debug(f"[Indeed] Found {len(more_cards)} additional job cards via pagination")
                                    job_cards.extend(more_cards)
                        except Exception as e:
                            logger.warning(f"[Indeed] Error fetching pagination: {str(e)}")
                    
                    for i, card in enumerate(job_cards[:limit]):
                        try:
                            # Debug the card HTML
                            logger.debug(f"[Indeed] Processing job card {i+1}: {card.prettify()[:200]}...")
                            
                            # Extract job ID
                            job_id = card.get('data-jk') or f"indeed-{i}"
                            
                            # Extract job title with multiple selectors
                            title_element = None
                            for title_selector in ['h2.jobTitle span[title]', 'a.jcs-JobTitle', 'h2.jobTitle a', '.jobTitle']:
                                title_element = card.select_one(title_selector)
                                if title_element:
                                    break
                            
                            title = ""
                            if title_element:
                                title = title_element.get('title', '') or title_element.text.strip()
                            
                            if not title:
                                title = "Job Position"
                            
                            # Extract company name
                            company_element = None
                            for company_selector in ['[data-testid="company-name"]', 'span.companyName', '.company']:
                                company_element = card.select_one(company_selector)
                                if company_element:
                                    break
                            
                            company = company_element.text.strip() if company_element else "Company"
                            
                            # Extract location
                            location_element = None
                            for location_selector in ['[data-testid="text-location"]', 'div.companyLocation', '.location']:
                                location_element = card.select_one(location_selector)
                                if location_element:
                                    break
                            
                            job_location = location_element.text.strip() if location_element else location
                            
                            # Generate job URL
                            job_url = f"https://www.indeed.com/viewjob?jk={job_id}" if job_id and job_id != f"indeed-{i}" else ""
                            
                            # Extract date with multiple selectors
                            date_element = None
                            for date_selector in ['span.date', '.date', '.jobAge']:
                                date_element = card.select_one(date_selector)
                                if date_element:
                                    break
                            
                            today = datetime.now()
                            date_posted = today.strftime("%Y-%m-%d")  # Default to today
                            
                            if date_element:
                                date_text = date_element.text.strip().lower()
                                logger.debug(f"[Indeed] Date text found: '{date_text}'")
                                
                                if 'just posted' in date_text or 'today' in date_text or 'posted today' in date_text:
                                    date_posted = today.strftime("%Y-%m-%d")
                                elif 'yesterday' in date_text:
                                    date_posted = (today - timedelta(days=1)).strftime("%Y-%m-%d")
                                elif '+' in date_text and 'day' in date_text:
                                    # Handle patterns like "30+ days ago"
                                    days_match = re.search(r'(\d+)', date_text)
                                    if days_match:
                                        days_ago = int(days_match.group(1))
                                        date_posted = (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")
                                elif 'day' in date_text:
                                    # Handle patterns like "3 days ago"
                                    days_match = re.search(r'(\d+)', date_text)
                                    if days_match:
                                        days_ago = int(days_match.group(1))
                                        date_posted = (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")
                            
                            # Extract salary if available
                            salary = None
                            salary_element = card.select_one('[class*="salary-snippet"]') or card.select_one('div.salary-snippet-container')
                            if salary_element:
                                salary = salary_element.text.strip()
                            
                            # Create job listing with enhanced source labeling
                            job = {
                                "id": f"indeed-{job_id}",
                                "title": title,
                                "company": company,
                                "location": job_location,
                                "salary": salary,
                                "date_posted": date_posted,
                                "job_url": job_url,
                                "source": "Indeed",
                                "source_label": "Indeed Job",
                                "source_icon": "indeed",
                                "description": f"This job for {title} at {company} was recently posted on Indeed. Click to view the complete description and apply."
                            }
                            jobs.append(job)
                            logger.debug(f"[Indeed] Successfully parsed job: {title} at {company}")
                        except Exception as e:
                            logger.error(f"[Indeed] Error parsing job card {i+1}: {str(e)}")
                    
                    if jobs:
                        logger.info(f"[Indeed] Found {len(jobs)} jobs from URL attempt {url_index+1}")
                        # If we found jobs, we can break out of the URL loop
                        break
                        
            except Exception as e:
                logger.error(f"[Indeed] Error with URL {url_index+1}: {str(e)}")
        
        logger.info(f"[Indeed] Found {len(jobs)} jobs total")
        return jobs
    except Exception as e:
        logger.exception(f"[Indeed] Scraping error: {str(e)}")
        return []

@router.get("/recent-jobs")
async def get_recent_jobs(job_role: str, location: str, limit: int = 30):
    """Get the most recent jobs posted, sorted by date"""
    try:
        logger.info(f"Starting job scraping for '{job_role}' in '{location}', limit: {limit}")
        
        # Run LinkedIn and Indeed scrapers concurrently with increased limits
        linkedin_task = asyncio.create_task(scrape_linkedin(job_role, location, limit=limit))
        indeed_task = asyncio.create_task(scrape_indeed(job_role, location, limit=limit))
        
        # Wait for both scrapers to complete
        linkedin_jobs = await linkedin_task
        indeed_jobs = await indeed_task
        
        # Combine all jobs and add a visible label based on source
        all_jobs = []
        
        # Process LinkedIn jobs
        for job in linkedin_jobs:
            job["source_display"] = "LinkedIn"
            all_jobs.append(job)
            
        # Process Indeed jobs
        for job in indeed_jobs:
            job["source_display"] = "Indeed"
            all_jobs.append(job)
        
        logger.info(f"Total jobs found: {len(all_jobs)} (LinkedIn: {len(linkedin_jobs)}, Indeed: {len(indeed_jobs)})")
        
        # Sort by date (most recent first)
        sorted_jobs = sorted(all_jobs, key=lambda job: job.get('date_posted', ''), reverse=True)
        
        # Return only the requested number of jobs
        return {
            "success": True,
            "jobs": sorted_jobs[:limit],
            "total": len(sorted_jobs),
            "real_jobs_count": len(sorted_jobs),
            "sources": {
                "linkedin": len(linkedin_jobs),
                "indeed": len(indeed_jobs)
            },
            "message": f"Successfully retrieved {len(sorted_jobs)} recent jobs"
        }
    except Exception as e:
        logger.exception(f"Error retrieving recent jobs: {str(e)}")
        return {
            "success": False,
            "jobs": [],
            "total": 0,
            "message": f"Failed to retrieve recent jobs: {str(e)}"
        }