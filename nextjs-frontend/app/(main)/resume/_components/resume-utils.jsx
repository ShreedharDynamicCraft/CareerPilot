export const RESUME_SECTIONS = [
  "contact",
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "achievements",
  "languages"
];

export const formatSkills = (skills) => {
  if (!skills) return "";
  return skills.split('\n')
    .map(line => {
      const [category, items] = line.split(':');
      return !items ? `- ${line.trim()}` : `- **${category.trim()}:** ${items.trim()}`;
    })
    .join('\n');
};

export const formatProject = (project) => {
  if (!project) return "";
  let content = `### ${project.title}\n`;
  
  if (project.technologies) {
    content += `*${project.technologies.split(',').map(t => t.trim()).join(', ')}*\n\n`;
  }
  
  if (project.description) {
    content += project.description.split('\n')
      .filter(line => line.trim())
      .map(line => `- ${line.replace(/^[-•]\s*/, '').trim()}`)
      .join('\n') + '\n';
  }
  
  if (project.githubUrl || project.demoUrl) {
    content += '\n';
    if (project.githubUrl) content += `[GitHub](${project.githubUrl}) `;
    if (project.demoUrl) content += `[Live Demo](${project.demoUrl})`;
  }
  
  return content;
};

export const formatExperience = (experience) => {
  if (!experience) return "";
  let content = `### ${experience.title}\n*${experience.organization}* | `;
  
  if (experience.startDate) {
    content += `${experience.startDate} - ${experience.endDate || 'Present'}`;
    if (experience.location) content += ` | ${experience.location}`;
  }
  
  content += '\n\n';
  
  if (experience.description) {
    content += experience.description.split('\n')
      .filter(line => line.trim())
      .map(line => `- ${line.replace(/^[-•]\s*/, '').trim()}`)
      .join('\n') + '\n';
  }
  
  if (experience.technologies) {
    content += `\n**Technologies:** ${experience.technologies.split(',').map(t => t.trim()).join(', ')}\n`;
  }
  
  return content;
};

export const formatEducation = (education) => {
  if (!education) return "";
  let content = `### ${education.title}\n*${education.organization}* | `;
  
  if (education.startDate) {
    content += `${education.startDate} - ${education.endDate || 'Present'}`;
    if (education.location) content += ` | ${education.location}`;
  }
  
  content += '\n\n';
  
  if (education.gpa) content += `- GPA: ${education.gpa}\n`;
  if (education.relevantCourses) content += `- Relevant Coursework: ${education.relevantCourses}\n`;
  
  return content;
};

export const getContactMarkdown = (formValues, user) => {
  const { contactInfo } = formValues;
  const parts = [];
  if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
  if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
  if (contactInfo.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
  if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);
  if (contactInfo.github) parts.push(`💻 [GitHub](${contactInfo.github})`);

  return parts.length > 0
    ? `## <div align="center">${user?.fullName || "Your Name"}</div>
      \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
    : "";
};

export const getCombinedContent = (formValues, user) => {
  const { summary, skills, experience, education, projects, achievements, languages } = formValues;
  
  return [
    getContactMarkdown(formValues, user),
    summary && `## Professional Summary\n\n${summary}`,
    skills && `## Technical Skills\n\n${formatSkills(skills)}`,
    experience?.length > 0 && `## Work Experience\n\n${experience.map(exp => formatExperience(exp)).join('\n\n')}`,
    education?.length > 0 && `## Education\n\n${education.map(edu => formatEducation(edu)).join('\n\n')}`,
    projects?.length > 0 && `## Projects\n\n${projects.map(proj => formatProject(proj)).join('\n\n')}`,
    achievements && `## Achievements & Certifications\n\n${achievements.split('\n').map(a => `- ${a.trim()}`).join('\n')}`,
    languages && `## Languages\n\n${languages.split(',').map(l => `- ${l.trim()}`).join('\n')}`,
  ].filter(Boolean).join('\n\n');
};