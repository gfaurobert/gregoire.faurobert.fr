/**
 * CV Online Static Site - JavaScript Enhancements
 * Adds interactive features to the static Hugo-generated CV
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    cleanupDuplicatedContactInfo();
    setupLanguageSwitcher();
    setupSmoothScrolling();
    setupPrintOptimization();
    setupCopyEmail();
    setupSectionHighlighting();
    setupResponsiveNavigation();
    
    // Load default language (German) on page load after a short delay to ensure DOM is ready
    setTimeout(() => {
      loadDefaultLanguage();
    }, 100);
  }

  /**
   * Load default language data on page load
   */
  async function loadDefaultLanguage() {
    try {
      const response = await fetch('/data_de.json');
      const data = await response.json();
      applyLanguageData(data, 'de');
      
      // Set German button as active
      const deBtn = document.querySelector('.lang-btn[data-lang="de"]');
      if (deBtn) {
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        deBtn.classList.add('active');
      }
    } catch (error) {
      console.error('Failed to load default language data:', error);
    }
  }

  /**
   * Translate common words/phrases
   */
  function translateCommon(text, lang) {
    if (!text) return text;
    const translations = {
      'continued': { de: 'Fortsetzung', en: 'continued', fr: 'suite' },
      '(continued)': { de: '(Fortsetzung)', en: '(continued)', fr: '(suite)' }
    };
    
    for (const [key, value] of Object.entries(translations)) {
      if (text.includes(key)) {
        text = text.replace(key, value[lang] || value.en);
      }
    }
    return text;
  }

  /**
   * Clean up duplicated contact information
   * Fixes any duplication that might exist in the HTML
   */
  function cleanupDuplicatedContactInfo() {
    const contactItems = document.querySelectorAll('.cv-contact-item');
    contactItems.forEach(item => {
      // Find span or anchor elements
      const textElement = item.querySelector('span, a');
      if (textElement) {
        const text = textElement.textContent.trim();
        // Check if text appears to be duplicated (same text repeated)
        const words = text.split(/\s+/);
        const midPoint = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, midPoint).join(' ');
        const secondHalf = words.slice(midPoint).join(' ');
        
        // If first half equals second half, it's duplicated
        if (firstHalf === secondHalf && words.length > 2) {
          textElement.textContent = firstHalf;
        }
      }
    });
  }

  /**
   * Language Switcher
   * Allows switching between different language versions of the CV
   */
  function setupLanguageSwitcher() {
    const languageData = {
      en: '/data_en.json',
      fr: '/data_fr.json',
      de: '/data_de.json'
    };

    // Create language switcher button
    const langSwitcher = document.createElement('div');
    langSwitcher.className = 'lang-switcher';
    langSwitcher.innerHTML = `
      <button class="lang-btn active" data-lang="en" title="English">EN</button>
      <button class="lang-btn" data-lang="fr" title="Français">FR</button>
      <button class="lang-btn" data-lang="de" title="Deutsch">DE</button>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .lang-switcher {
        position: fixed;
        top: 20px;
        left: 20px;
        display: flex;
        gap: 8px;
        z-index: 1001;
        background: rgba(255, 255, 255, 0.95);
        padding: 8px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .lang-btn {
        padding: 6px 12px;
        border: 1px solid var(--cv-border, #e2e8f0);
        background: white;
        color: var(--cv-text-primary, #1e293b);
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      .lang-btn:hover {
        background: var(--cv-surface, #f8fafc);
        border-color: var(--cv-primary, #2563eb);
      }
      .lang-btn.active {
        background: var(--cv-primary, #2563eb);
        color: white;
        border-color: var(--cv-primary, #2563eb);
      }
      @media print {
        .lang-switcher {
          display: none;
        }
      }
      @media (max-width: 768px) {
        .lang-switcher {
          top: 10px;
          left: 10px;
          padding: 6px;
        }
        .lang-btn {
          padding: 4px 8px;
          font-size: 11px;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(langSwitcher);

    // Handle language switching
    const buttons = langSwitcher.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', async function() {
        const lang = this.dataset.lang;
        
        // Update active state
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Load and apply language data
        try {
          const response = await fetch(languageData[lang]);
          const data = await response.json();
          applyLanguageData(data, lang);
        } catch (error) {
          console.error('Failed to load language data:', error);
        }
      });
    });
  }

  /**
   * Convert markdown-like text to HTML
   */
  function markdownToHtml(text) {
    if (!text) return '';
    
    // Split by double newlines to handle paragraphs
    const sections = text.split(/\n\n+/);
    let html = '';
    
    sections.forEach(section => {
      const trimmed = section.trim();
      if (!trimmed) return;
      
      // Check if section starts with ** (bold header)
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        // It's a bold header
        const headerText = trimmed.replace(/\*\*/g, '');
        html += '<p><strong>' + headerText + '</strong></p>\n';
      } else if (trimmed.includes('\n+ ') || trimmed.startsWith('+ ')) {
        // It's a list
        const lines = trimmed.split('\n');
        let listItems = [];
        let currentParagraph = '';
        
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('+ ')) {
            // Save previous paragraph if exists
            if (currentParagraph) {
              html += '<p>' + currentParagraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>\n';
              currentParagraph = '';
            }
            // Add list item
            let itemText = trimmedLine.substring(2);
            itemText = itemText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            listItems.push(itemText);
          } else if (trimmedLine) {
            // Regular line - could be part of paragraph or list continuation
            if (listItems.length > 0) {
              // Finish the list first
              html += '<ul>\n';
              listItems.forEach(item => {
                html += '<li>' + item + '</li>\n';
              });
              html += '</ul>\n';
              listItems = [];
            }
            // Add to current paragraph
            if (currentParagraph) currentParagraph += ' ';
            currentParagraph += trimmedLine;
          }
        });
        
        // Finish any remaining list
        if (listItems.length > 0) {
          html += '<ul>\n';
          listItems.forEach(item => {
            html += '<li>' + item + '</li>\n';
          });
          html += '</ul>\n';
        }
        
        // Finish any remaining paragraph
        if (currentParagraph) {
          html += '<p>' + currentParagraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>\n';
        }
      } else {
        // Regular paragraph
        let paraText = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Handle links in markdown format [text](url)
        paraText = paraText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        html += '<p>' + paraText + '</p>\n';
      }
    });
    
    return html.trim();
  }

  /**
   * Apply language data to the page
   */
  function applyLanguageData(data, lang = 'de') {
    // Update basic info
    if (data.basic?.name) {
      const nameEl = document.querySelector('.cv-name');
      if (nameEl) nameEl.textContent = data.basic.name;
    }

    // Update contact info
    if (data.contact) {
      const contactMap = {
        location: '.cv-contact-item:has(i.fa-map-marker-alt)',
        email: '.cv-contact-item:has(i.fa-envelope)',
        phone: '.cv-contact-item:has(i.fa-phone)',
        website: '.cv-contact-item:has(i.fa-globe)'
      };

      Object.entries(contactMap).forEach(([key, selector]) => {
        const contactItem = document.querySelector(selector);
        if (contactItem && data.contact[key]) {
          // Find the span or anchor element that contains the text
          const textElement = contactItem.querySelector('span, a');
          if (textElement) {
            if (key === 'email' || key === 'website') {
              textElement.textContent = data.contact[key];
            } else {
              textElement.textContent = data.contact[key];
            }
          }
        }
      });
    }

    // Update profile section
    if (data.profile) {
      // Update profile title - find section with profile title
      const allSections = document.querySelectorAll('.cv-section');
      allSections.forEach(section => {
        const titleEl = section.querySelector('.cv-section-title');
        if (titleEl) {
          const titleText = titleEl.textContent.trim();
          // Match profile section by checking if it contains profile-related keywords
          const isProfileSection = titleText.includes('Professional Profile') || 
              titleText.includes('Berufliches Profil') ||
              titleText.includes('Profil professionnel') ||
              titleText === 'Professional Profile' ||
              titleText === 'Berufliches Profil' ||
              titleText === 'Profil professionnel';
          if (isProfileSection) {
            if (data.profile.title) {
              titleEl.textContent = data.profile.title;
            }
            
            // Update profile description in this section
            if (data.profile.description) {
              const profileEl = section.querySelector('.cv-description');
              if (profileEl) {
                // Convert markdown to HTML and format as paragraphs
                const html = markdownToHtml(data.profile.description);
                profileEl.innerHTML = html;
              }
            }
          }
        }
      });
    }

    // Update experience section
    if (data.experience) {
      // Update experience section title
      const allSections = document.querySelectorAll('.cv-section');
      allSections.forEach(section => {
        const titleEl = section.querySelector('.cv-section-title');
        if (titleEl) {
          const titleText = titleEl.textContent.trim();
          // Match experience section
          const isExperienceSection = titleText.includes('Career Summary') || 
              titleText.includes('Beruflicher Werdegang') ||
              titleText.includes('Résumé de carrière') ||
              titleText === 'Career Summary' ||
              titleText === 'Beruflicher Werdegang' ||
              titleText === 'Résumé de carrière' ||
              titleText.includes('continued') ||
              titleText.includes('Fortsetzung') ||
              titleText.includes('suite');
          if (isExperienceSection) {
            if (data.experience.title) {
              const isContinued = titleText.includes('continued') || titleText.includes('Fortsetzung') || titleText.includes('suite');
              if (isContinued) {
                titleEl.textContent = data.experience.title + ' ' + translateCommon('(continued)', lang);
              } else {
                titleEl.textContent = data.experience.title;
              }
            }
          }
        }
      });

      // Update experience items
      if (data.experience.items) {
        const experienceItems = document.querySelectorAll('.cv-experience-item');
        experienceItems.forEach((item, index) => {
          const expData = data.experience.items[index];
          if (!expData) return;

          // Update role
          const roleEl = item.querySelector('.cv-experience-role');
          if (roleEl && expData.role) {
            roleEl.textContent = expData.role;
          }

          // Update date
          const dateEl = item.querySelector('.cv-experience-date');
          if (dateEl && expData.date) {
            dateEl.textContent = expData.date;
          }

          // Update company
          const companyEl = item.querySelector('.cv-experience-company');
          if (companyEl && expData.company) {
            companyEl.textContent = expData.company;
          }

          // Update location
          const locationEl = item.querySelector('.cv-experience-location');
          if (locationEl && expData.location) {
            locationEl.textContent = expData.location;
          }

          // Update description
          const descEl = item.querySelector('.cv-experience-description');
          if (descEl && expData.description) {
            descEl.innerHTML = markdownToHtml(expData.description);
          }
        });
      }
    }

    // Update skills section
    if (data.skill) {
      // Update skill section title
      const skillGroupTitle = document.querySelector('.cv-skill-group-title');
      if (skillGroupTitle && data.skill.title) {
        skillGroupTitle.textContent = data.skill.title;
      }

      // Update skill items
      if (data.skill.groups && data.skill.groups[0] && data.skill.groups[0].item) {
        const skillItems = document.querySelectorAll('.cv-skill-item');
        const skillData = data.skill.groups[0].item;
        
        skillItems.forEach((item, index) => {
          if (skillData[index]) {
            item.textContent = skillData[index];
          }
        });
      }
    }

    // Update education section
    if (data.education) {
      // Update education section titles (both sidebar and main)
      const educationTitles = document.querySelectorAll('.cv-sidebar-section-title');
      educationTitles.forEach(titleEl => {
        const titleText = titleEl.textContent;
        const isEducationSection = titleText.includes('Education') || 
            titleText.includes('Bildung') ||
            titleText.includes('Formation') ||
            titleText.includes('Professional Development') ||
            titleText.includes('Berufliche Entwicklung') ||
            titleText.includes('développement professionnel');
        if (isEducationSection) {
          if (data.education.title) {
            const isContinued = titleText.includes('continued') || titleText.includes('Fortsetzung') || titleText.includes('suite');
            if (isContinued) {
              titleEl.textContent = data.education.title + ' ' + translateCommon('(continued)', lang);
            } else {
              titleEl.textContent = data.education.title;
            }
          }
        }
      });

      // Update education items in sidebar
      if (data.education.items) {
        const educationItems = document.querySelectorAll('.cv-education-sidebar-item');
        educationItems.forEach((item, index) => {
          const eduData = data.education.items[index];
          if (!eduData) return;

          // Update institution
          const institutionEl = item.querySelector('.cv-education-institution');
          if (institutionEl && eduData.institution) {
            institutionEl.textContent = eduData.institution;
          }

          // Update degree
          const degreeEl = item.querySelector('.cv-education-degree');
          if (degreeEl && eduData.degree) {
            if (eduData.major) {
              degreeEl.textContent = eduData.degree + ' in ' + eduData.major;
            } else {
              degreeEl.textContent = eduData.degree;
            }
          }

          // Update date
          const dateEl = item.querySelector('.cv-education-date');
          if (dateEl && eduData.date) {
            dateEl.textContent = eduData.date;
          }
        });
      }
    }

    // Update projects section
    if (data.project) {
      // Update project section title
      const projectTitles = document.querySelectorAll('.cv-sidebar-section-title');
      projectTitles.forEach(titleEl => {
        if (titleEl.textContent.includes('Side Projects') || titleEl.textContent.includes('Nebenprojekte')) {
          if (data.project.title) {
            titleEl.textContent = data.project.title;
          }
        }
      });

      // Update project items
      if (data.project.items && data.project.items[0]) {
        const projectItem = document.querySelector('.cv-project-sidebar-item');
        if (projectItem) {
          const projData = data.project.items[0];

          // Update project name
          const nameEl = projectItem.querySelector('.cv-project-name');
          if (nameEl && projData.name) {
            nameEl.textContent = projData.name;
          }

          // Update project date
          const dateEl = projectItem.querySelector('.cv-project-date');
          if (dateEl && projData.date) {
            dateEl.textContent = projData.date;
          }

          // Update project description
          const descEl = projectItem.querySelector('.cv-project-description');
          if (descEl && projData.description) {
            descEl.innerHTML = markdownToHtml(projData.description);
          }
        }
      }
    }

    // Update references section
    if (data.reference) {
      // Update reference section title
      const referenceTitles = document.querySelectorAll('.cv-sidebar-section-title');
      referenceTitles.forEach(titleEl => {
        if (titleEl.textContent.includes('References') || titleEl.textContent.includes('Referenzen')) {
          if (data.reference.title) {
            titleEl.textContent = data.reference.title;
          }
        }
      });

      // Update reference items
      if (data.reference.items && data.reference.items[0]) {
        const referenceItem = document.querySelector('.cv-reference-item');
        if (referenceItem) {
          const refData = data.reference.items[0];

          // Update reference name
          const nameEl = referenceItem.querySelector('.cv-reference-name');
          if (nameEl && refData.name) {
            nameEl.textContent = refData.name;
          }
        }
      }
    }
  }

  /**
   * Smooth Scrolling
   * Adds smooth scrolling behavior for anchor links
   */
  function setupSmoothScrolling() {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  /**
   * Print Optimization
   * Enhances print functionality
   */
  function setupPrintOptimization() {
    // Add print button if PDF button exists
    const pdfBtn = document.querySelector('.pdf-download-btn');
    if (pdfBtn) {
      const printBtn = document.createElement('button');
      printBtn.className = 'print-btn';
      printBtn.innerHTML = '<i class="fas fa-print"></i> Print';
      printBtn.title = 'Print resume';
      printBtn.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: var(--cv-secondary, #64748b);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
        transition: all 0.2s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      
      printBtn.addEventListener('mouseenter', function() {
        this.style.background = '#475569';
        this.style.transform = 'translateY(-2px)';
      });
      
      printBtn.addEventListener('mouseleave', function() {
        this.style.background = 'var(--cv-secondary, #64748b)';
        this.style.transform = 'translateY(0)';
      });
      
      printBtn.addEventListener('click', function() {
        window.print();
      });

      // Hide on print
      const printStyle = document.createElement('style');
      printStyle.textContent = `
        @media print {
          .print-btn {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .print-btn {
            top: 60px;
            right: 10px;
            padding: 10px 16px;
            font-size: 12px;
          }
        }
      `;
      document.head.appendChild(printStyle);
      document.body.appendChild(printBtn);
    }
  }

  /**
   * Copy Email to Clipboard
   * Adds click-to-copy functionality for email
   */
  function setupCopyEmail() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const email = this.href.replace('mailto:', '');
        
        // Try to copy to clipboard
        if (navigator.clipboard) {
          e.preventDefault();
          navigator.clipboard.writeText(email).then(() => {
            showNotification('Email copied to clipboard!');
          }).catch(() => {
            // Fallback: open mailto
            window.location.href = this.href;
          });
        }
      });
    });
  }

  /**
   * Section Highlighting
   * Highlights sections on scroll
   */
  function setupSectionHighlighting() {
    const sections = document.querySelectorAll('.cv-section');
    
    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('cv-section-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-50px 0px'
    });

    sections.forEach(section => {
      observer.observe(section);
    });

    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
      .cv-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .cv-section-visible {
        opacity: 1;
        transform: translateY(0);
      }
      @media print {
        .cv-section {
          opacity: 1;
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Responsive Navigation
   * Adds a table of contents for mobile
   */
  function setupResponsiveNavigation() {
    if (window.innerWidth > 768) return;

    const sections = document.querySelectorAll('.cv-section-title');
    if (sections.length === 0) return;

    const nav = document.createElement('nav');
    nav.className = 'cv-mobile-nav';
    nav.innerHTML = '<button class="cv-nav-toggle"><i class="fas fa-bars"></i></button><ul class="cv-nav-menu"></ul>';

    sections.forEach((title, index) => {
      const text = title.textContent.trim();
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#section-${index}`;
      a.textContent = text;
      a.addEventListener('click', function(e) {
        e.preventDefault();
        title.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nav.classList.remove('active');
      });
      li.appendChild(a);
      nav.querySelector('.cv-nav-menu').appendChild(li);
      
      // Add ID to section
      const section = title.closest('.cv-section');
      if (section) {
        section.id = `section-${index}`;
      }
    });

    const toggle = nav.querySelector('.cv-nav-toggle');
    toggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .cv-mobile-nav {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1002;
      }
      .cv-nav-toggle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--cv-primary, #2563eb);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cv-nav-menu {
        position: absolute;
        bottom: 60px;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        list-style: none;
        padding: 8px;
        margin: 0;
        min-width: 200px;
        max-height: 300px;
        overflow-y: auto;
        display: none;
      }
      .cv-mobile-nav.active .cv-nav-menu {
        display: block;
      }
      .cv-nav-menu li {
        margin: 0;
      }
      .cv-nav-menu a {
        display: block;
        padding: 8px 12px;
        color: var(--cv-text-primary, #1e293b);
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
      }
      .cv-nav-menu a:hover {
        background: var(--cv-surface, #f8fafc);
      }
      @media (min-width: 769px) {
        .cv-mobile-nav {
          display: none;
        }
      }
      @media print {
        .cv-mobile-nav {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(nav);
  }

  /**
   * Show Notification
   * Displays a temporary notification message
   */
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cv-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--cv-primary, #2563eb);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      animation: slideUp 0.3s ease;
    `;

    const keyframes = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = keyframes;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease reverse';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

})();
