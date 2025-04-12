// resume-templates.jsx
export const RESUME_TEMPLATES = {
    DEFAULT: {
      id: 'DEFAULT',
      name: 'Default',
      formatContact: (contactInfo, user) => {
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
      },
      formatSection: (title, content) => `## ${title}\n\n${content}`,
      formatExperience: (exp) => {
        let content = `### ${exp.title}\n*${exp.organization}* | `;
        if (exp.startDate) {
          content += `${exp.startDate} - ${exp.endDate || 'Present'}`;
          if (exp.location) content += ` | ${exp.location}`;
        }
        content += '\n\n';
        if (exp.description) {
          content += exp.description.split('\n')
            .filter(line => line.trim())
            .map(line => `- ${line.replace(/^[-•]\s*/, '').trim()}`)
            .join('\n') + '\n';
        }
        if (exp.technologies) {
          content += `\n**Technologies:** ${exp.technologies.split(',').map(t => t.trim()).join(', ')}\n`;
        }
        return content;
      },
      formatEducation: (edu) => {
        let content = `### ${edu.title}\n*${edu.organization}* | `;
        if (edu.startDate) {
          content += `${edu.startDate} - ${edu.endDate || 'Present'}`;
          if (edu.location) content += ` | ${edu.location}`;
        }
        content += '\n\n';
        if (edu.gpa) content += `- GPA: ${edu.gpa}\n`;
        if (edu.relevantCourses) content += `- Relevant Coursework: ${edu.relevantCourses}\n`;
        return content;
      }
    },
    MODERN: {
      id: 'MODERN',
      name: 'Modern',
      formatContact: (contactInfo, user) => {
        const parts = [];
        if (contactInfo.email) parts.push(`✉️ ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin) parts.push(`🔗 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.github) parts.push(`</> [GitHub](${contactInfo.github})`);
  
        return `# ${user?.fullName || "Your Name"}
                \n\n${parts.join(" | ")}\n\n---\n`;
      },
      formatSection: (title, content) => `## ${title}\n${content}\n`,
      formatExperience: (exp) => {
        let content = `### ${exp.title}\n`;
        content += `**${exp.organization}** | ${exp.location || ''}\n`;
        content += `*${exp.startDate} - ${exp.endDate || 'Present'}*\n\n`;
        if (exp.description) {
          content += exp.description.split('\n')
            .filter(line => line.trim())
            .map(line => `• ${line.replace(/^[-•]\s*/, '').trim()}`)
            .join('\n') + '\n';
        }
        if (exp.technologies) {
          content += `\n*Technologies:* ${exp.technologies.split(',').map(t => t.trim()).join(', ')}\n`;
        }
        return content;
      }
    },
    CLASSIC: {
      id: 'CLASSIC',
      name: 'Classic',
      formatContact: (contactInfo, user) => {
        const parts = [];
        if (contactInfo.email) parts.push(`Email: ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`Phone: ${contactInfo.mobile}`);
        if (contactInfo.linkedin) parts.push(`LinkedIn: [${contactInfo.linkedin.split('/').pop()}](${contactInfo.linkedin})`);
        if (contactInfo.github) parts.push(`GitHub: [${contactInfo.github.split('/').pop()}](${contactInfo.github})`);
  
        return `# ${user?.fullName || "Your Name"}
                \n\n${parts.join(" | ")}\n\n---\n`;
      },
      formatSection: (title, content) => `## ${title.toUpperCase()}\n\n${content}`,
      formatExperience: (exp) => {
        let content = `**${exp.title}**\n`;
        content += `${exp.organization}, ${exp.location || ''}\n`;
        content += `${exp.startDate} - ${exp.endDate || 'Present'}\n\n`;
        if (exp.description) {
          content += exp.description.split('\n')
            .filter(line => line.trim())
            .map(line => `▪ ${line.replace(/^[-•]\s*/, '').trim()}`)
            .join('\n') + '\n';
        }
        return content;
      }
    },
    ACADEMIC: {
      id: 'ACADEMIC',
      name: 'Academic',
      formatContact: (contactInfo, user) => {
        const parts = [];
        if (contactInfo.email) parts.push(`✉️ ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📞 ${contactInfo.mobile}`);
        if (contactInfo.linkedin) parts.push(`🔗 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.github) parts.push(`⚙️ [GitHub](${contactInfo.github})`);
  
        return `# ${user?.fullName || "Your Name"}
                \n\n${parts.join(" | ")}\n\n---\n`;
      },
      formatSection: (title, content) => `## ${title}\n${'-'.repeat(title.length)}\n\n${content}`,
      formatExperience: (exp) => {
        let content = `**${exp.title}**\n`;
        content += `*${exp.organization}* | ${exp.location || ''}\n`;
        content += `${exp.startDate} - ${exp.endDate || 'Present'}\n\n`;
        if (exp.description) {
          content += exp.description.split('\n')
            .filter(line => line.trim())
            .map(line => `‣ ${line.replace(/^[-•]\s*/, '').trim()}`)
            .join('\n') + '\n';
        }
        if (exp.technologies) {
          content += `\n*Technologies:* ${exp.technologies}\n`;
        }
        return content;
      },
      formatEducation: (edu) => {
        let content = `**${edu.title}**\n`;
        content += `*${edu.organization}* | ${edu.location || ''}\n`;
        content += `${edu.startDate} - ${edu.endDate || 'Present'}\n`;
        if (edu.gpa) content += `\n**GPA:** ${edu.gpa}\n`;
        if (edu.relevantCourses) content += `**Relevant Coursework:** ${edu.relevantCourses}\n`;
        return content;
      }
    }
  };