const htmlEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
htmlEl.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

function toggleTheme(){
  const isDark = htmlEl.getAttribute('data-theme') === 'dark';
  htmlEl.setAttribute('data-theme', isDark ? 'light' : 'dark');
}
themeToggle.addEventListener('click', toggleTheme);
if(themeToggleMobile){
  themeToggleMobile.addEventListener('click', toggleTheme);
}

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const layers = [
  { el: document.getElementById('layerFar'),   rate: 0.02 },
  { el: document.getElementById('layerMid'),   rate: 0.05 },
  { el: document.getElementById('layerNear'),  rate: 0.09 },
  { el: document.getElementById('layerFront'), rate: 0.14 },
];
const MAX_OFFSET = 60;

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function updateParallax(){
  if(reduceMotion) return;
  const y = window.scrollY;
  layers.forEach(({ el, rate }) => {
    const offset = clamp(y * rate, -MAX_OFFSET, MAX_OFFSET);
    el.style.transform = `translateX(-50%) translateY(${offset}px)`;
  });
}

let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){
    window.requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
    ticking = true;
  }
}, { passive:true });

updateParallax();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function animateCountUp(el, target, suffix){
  let current = 0;
  const duration = 1200;
  const steps = 40;
  const increment = target / steps;
  const stepTime = duration / steps;
  const timer = setInterval(() => {
    current += increment;
    if(current >= target){
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, stepTime);
}

function showDataError(container, message){
  if(!container) return;
  container.innerHTML = `<p class="data-error">${message}</p>`;
}

fetch('assets/data/stats.json')
  .then(res => {
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(items => {
    const container = document.getElementById('statsContainer');
    if(!container) return;
    container.innerHTML = '';
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const numEl = entry.target.querySelector('.stat-num');
          animateCountUp(numEl, parseInt(numEl.dataset.count, 10), numEl.dataset.suffix);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <span class="stat-num" data-count="${item.count}" data-suffix="${item.suffix}">0</span>
        <span class="stat-label">${item.label}</span>
      `;
      container.appendChild(row);
      statObserver.observe(row);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar stats.json:', err);
    showDataError(document.getElementById('statsContainer'), 'Não foi possível carregar os números.');
  });

fetch('assets/data/skills.json')
  .then(res => {
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(groups => {
    const container = document.getElementById('skillsContainer');
    if(!container) return;
    container.innerHTML = '';
    groups.forEach(group => {
      const pillsHtml = group.items.map(item => `
        <span class="pill">
          <span class="pill-icon"><i class="${item.icon}"></i></span>${item.name}
        </span>
      `).join('');
      const el = document.createElement('div');
      el.className = 'skill-group reveal';
      el.innerHTML = `
        <h3>${group.group}</h3>
        <div class="pill-list">${pillsHtml}</div>
      `;
      container.appendChild(el);
      revealObserver.observe(el);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar skills.json:', err);
    showDataError(document.getElementById('skillsContainer'), 'Não foi possível carregar as habilidades.');
  });

fetch('assets/data/experience.json')
  .then(res => {
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(items => {
    const container = document.getElementById('experienceContainer');
    if(!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
      const el = document.createElement('div');
      el.className = 'experience-item reveal';
      el.innerHTML = `
        <div class="experience-period">
          <span class="period">${item.period}</span>
          <span class="modality">${item.modality}</span>
        </div>
        <div class="experience-info">
          <h3>${item.company}</h3>
          <span class="experience-role">${item.role}</span>
          <p>${item.description}</p>
          <div class="project-tags">${tagsHtml}</div>
        </div>
      `;
      container.appendChild(el);
      revealObserver.observe(el);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar experience.json:', err);
    showDataError(document.getElementById('experienceContainer'), 'Não foi possível carregar a experiência profissional.');
  });

fetch('assets/data/projects.json')
  .then(res => {
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(items => {
    const container = document.getElementById('projectsContainer');
    if(!container) return;
    container.innerHTML = '';
    
    items.forEach(item => {
      const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
      
      const el = document.createElement(item.link ? 'a' : 'div');
      el.className = 'project-item reveal';
      
      if(item.link){
        el.href = item.link;
        el.target = '_blank';
        el.rel = 'noopener';
      }

      const arrowHtml = item.link 
        ? `<div class="project-arrow">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <line x1="5" y1="12" x2="19" y2="12"></line>
               <polyline points="12 5 19 12 12 19"></polyline>
             </svg>
            </div>` 
        : '';

      el.innerHTML = `
        <div class="project-info">
          <span class="project-type">${item.type}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="project-tags">${tagsHtml}</div>
        </div>
        ${arrowHtml}
      `;
      
      container.appendChild(el);
      revealObserver.observe(el);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar projects.json:', err);
    showDataError(document.getElementById('projectsContainer'), 'Não foi possível carregar os projetos.');
  });

fetch('assets/data/testimonials.json')
  .then(res => {
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(items => {
    const container = document.getElementById('testimonialsContainer');
    if(!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'testi-card reveal';
      card.innerHTML = `
        <p class="testi-quote">${item.quote}</p>
        <div class="testi-author">
          <strong>${item.name}</strong>
          <span>${item.context}</span>
        </div>
      `;
      container.appendChild(card);
      revealObserver.observe(card);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar testimonials.json:', err);
    showDataError(document.getElementById('testimonialsContainer'), 'Não foi possível carregar os depoimentos.');
  });

const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e) => e.preventDefault());
}