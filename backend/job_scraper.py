import requests
import json
from bs4 import BeautifulSoup
from fastapi import APIRouter, Query
from typing import Optional
import asyncio
import aiohttp
from datetime import datetime

router = APIRouter()

async def scrape_linkedin(job_role: str, location: str) -> list:
    """Scrape job listings from LinkedIn"""
    try:
        # This is a simplified implementation. In a production environment,
        # you would need to handle authentication, pagination, and rate limiting
        url = f"https://www.linkedin.com/jobs/search/?keywords={job_role}&location={location}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                jobs = []
                job_cards = soup.find_all('div', class_='base-card')
                
                for card in job_cards[:10]:  # Limit to 10 results
                    try:
                        title_elem = card.find('h3', class_='base-search-card__title')
                        company_elem = card.find('h4', class_='base-search-card__subtitle')
                        location_elem = card.find('span', class_='job-search-card__location')
                        link_elem = card.find('a', class_='base-card__full-link')
                        
                        title = title_elem.text.strip() if title_elem else "Unknown Title"
                        company = company_elem.text.strip() if company_elem else "Unknown Company"
                        job_location = location_elem.text.strip() if location_elem else location
                        link = link_elem['href'] if link_elem else "#"
                        
                        jobs.append({
                            "id": f"linkedin-{len(jobs)}",
                            "title": title,
                            "company": company,
                            "location": job_location,
                            "description": "",  # Would require additional request to job page
                            "postedDate": datetime.now().isoformat(),
                            "source": "linkedin",
                            "applyUrl": link
                        })
                    except Exception as e:
                        print(f"Error parsing LinkedIn job card: {e}")
                        continue
                
                return jobs
    except Exception as e:
        print(f"Error scraping LinkedIn: {e}")
        return []

async def scrape_indeed(job_role: str, location: str) -> list:
    """Scrape job listings from Indeed"""
    try:
        url = f"https://www.indeed.com/jobs?q={job_role}&l={location}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                jobs = []
                job_cards = soup.find_all('div', class_='job_seen_beacon')
                
                for card in job_cards[:10]:  # Limit to 10 results
                    try:
                        title_elem = card.find('h2', class_='jobTitle')
                        company_elem = card.find('span', class_='companyName')
                        location_elem = card.find('div', class_='companyLocation')
                        
                        title = title_elem.text.strip() if title_elem else "Unknown Title"
                        company = company_elem.text.strip() if company_elem else "Unknown Company"
                        job_location = location_elem.text.strip() if location_elem else location
                        
                        # Extract job ID and create apply URL
                        job_id = card.get('data-jk', '')
                        apply_url = f"https://www.indeed.com/viewjob?jk={job_id}" if job_id else "#"
                        
                        jobs.append({
                            "id": f"indeed-{job_id if job_id else len(jobs)}",
                            "title": title,
                            "company": company,
                            "location": job_location,
                            "description": "",  # Would require additional request
                            "postedDate": datetime.now().isoformat(),
                            "source": "indeed",
                            "applyUrl": apply_url
                        })
                    except Exception as e:
                        print(f"Error parsing Indeed job card: {e}")
                        continue
                
                return jobs
    except Exception as e:
        print(f"Error scraping Indeed: {e}")
        return []

async def scrape_google_jobs(job_role: str, location: str) -> list:
    """Simulate scraping from Google Jobs (actual implementation would require more complex handling)"""
    try:
        # Note: This is a simplified implementation as Google Jobs doesn't have a public API
        # and scraping Google search results may violate terms of service
        # In a production environment, you would need to use a proper API or service
        
        # For demo purposes, we'll return mock data
        jobs = []
        for i in range(5):
            jobs.append({
                "id": f"google-{i}",
                "title": f"{job_role.title()} Position {i+1}",
                "company": f"Company {chr(65+i)}",
                "location": location,
                "description": f"This is a {job_role} position at Company {chr(65+i)} in {location}.",
                "postedDate": datetime.now().isoformat(),
                "source": "google",
                "applyUrl": "#"
            })
        
        return jobs
    except Exception as e:
        print(f"Error with Google Jobs: {e}")
        return []

@router.get("/scrape-jobs")
async def scrape_jobs(
    job_role: str = Query(..., description="Job title or role to search for"),
    location: str = Query(..., description="Location to search in")
):
    """Scrape job listings from multiple sources based on job role and location"""
    # Run all scrapers concurrently
    linkedin_task = asyncio.create_task(scrape_linkedin(job_role, location))
    indeed_task = asyncio.create_task(scrape_indeed(job_role, location))
    google_task = asyncio.create_task(scrape_google_jobs(job_role, location))
    
    # Wait for all scrapers to complete
    linkedin_jobs = await linkedin_task
    indeed_jobs = await indeed_task
    google_jobs = await google_task
    
    # Combine results
    all_jobs = linkedin_jobs + indeed_jobs + google_jobs
    
    return {
        "jobs": all_jobs,
        "sources": {
            "linkedin": len(linkedin_jobs),
            "indeed": len(indeed_jobs),
            "google": len(google_jobs)
        },
        "total": len(all_jobs)
    }