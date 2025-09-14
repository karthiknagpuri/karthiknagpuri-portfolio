// Consolidated JavaScript for Karthik Nagapuri's Website

// Command history storage
let commandHistory = [];
let historyIndex = -1;

// Terminal Commands System
const terminalCommands = {
    help: () => {
        return `Available commands:
• about - learn about me
• skills - view my technical skills  
• projects - see my ventures
• ls projects - list all projects with details
• cat [project] - view specific project
• contact - get in touch
• social - find me on social media
• resume - download my resume
• blog - latest blog posts
• history - show command history
• theme [dark/light] - change theme
• weather - current weather in Hyderabad
• stats - website statistics
• clear - clear terminal
• time - current time
• quote - random startup quote
• matrix - enter the matrix
• whoami - who am i?
• story - my journey from rural to tech
• timeline - interactive career timeline
• stats - live metrics and achievements
• mission - my vision and goals
• journey - detailed life journey
• easter - discover hidden features`;
    },
    about: () => {
        return `Zero [Karthik Nagapuri]
━━━━━━━━━━━━━━━━━━━━━
AI Engineer | Founder | Ecosystem Builder

From a rural farming family to building founder-first 
ecosystems across Bharat. Founded 4 startups, mentored 
MSMEs, hosted 100+ events.

For me, Zero isn't emptiness — it's infinite possibility.`;
    },
    skills: () => {
        return `Technical Skills:
• Web Development & Design
• AI Engineering & Integration  
• Cybersecurity Fundamentals
• Full-Stack Development

Strategic Skills:
• Ecosystem Building
• Startup Mentorship
• Content Strategy
• Event Organization`;
    },
    projects: () => {
        return `Current Ventures:
• Feedbuzz - Content platform founder
• EvolveX - Ecosystem builder
• Nexteen & FeatureInndia - CTO
• CodingCubs - VP & Community leader`;
    },
    contact: () => {
        return `Let's connect:
📧 Email: karthik@evolvex.in
💬 WhatsApp: +91 98765 43210
📅 Calendar: calendly.com/karthiknagapuri
📍 Location: Hyderabad, India`;
    },
    social: () => {
        return `Find me online:
• GitHub: github.com/karthiknagapuri
• Twitter: @karthiknagpuri
• LinkedIn: linkedin.com/in/karthiknagpuri
• Medium: medium.com/@Karthiknagapuri`;
    },
    resume: () => {
        window.open('/resume.html', '_blank');
        return 'Opening resume...';
    },
    clear: () => {
        const output = document.getElementById('terminal-output');
        if (output) output.innerHTML = '';
        return '';
    },
    time: () => {
        return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    },
    quote: () => {
        const quotes = [
            "Build something people want - Paul Graham",
            "Move fast and break things - Mark Zuckerberg",
            "Stay hungry, stay foolish - Steve Jobs",
            "Ideas are worthless, execution is everything",
            "Fail fast, learn faster",
            "The best time to plant a tree was 20 years ago. The second best time is now",
            "Don't wait for opportunity. Create it",
            "Code is poetry written in logic"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    },
    'ls projects': () => {
        return `📁 Projects Directory:
━━━━━━━━━━━━━━━━━━━━━
• feedbuzz/      - Modern content platform
• evolvex/       - Startup ecosystem builder  
• nexteen/       - Next-gen tech solutions
• codingcubs/    - Tech community platform
• safblock/      - Blockchain solution

Use 'cat [project]' to view details`;
    },
    'cat feedbuzz': () => {
        return `📦 Feedbuzz
━━━━━━━━━━━━━━━
Modern content platform revolutionizing how people consume and share information.

🛠 Tech Stack: React, Node.js, MongoDB
👤 Role: Founder & Full-Stack Developer
🔗 Link: feedbuzzz.com
⭐ Status: Active & Growing`;
    },
    'cat evolvex': () => {
        return `🚀 EvolveX
━━━━━━━━━━━━━━━
Ecosystem connecting startup communities across India.

🛠 Tech Stack: Next.js, PostgreSQL, AWS
👤 Role: Founder & Ecosystem Builder
🔗 Link: evolvexaccelerator.com
⭐ Status: Scaling across 5 cities`;
    },
    'cat nexteen': () => {
        return `💡 Nexteen & FeatureInndia
━━━━━━━━━━━━━━━━━━━━━━━━━
Building innovative tech solutions for next-generation problems.

🛠 Tech Stack: Python, AI/ML, Cloud Native
👤 Role: Chief Technology Officer
⭐ Status: Multiple products in production`;
    },
    'cat codingcubs': () => {
        return `🎓 CodingCubs
━━━━━━━━━━━━━━━
Elevated tech community at Anurag University.

🛠 Focus: Education, Workshops, Hackathons
👤 Role: Vice President
👥 Community: 500+ active members
⭐ Status: 50+ events organized`;
    },
    blog: () => {
        return `📝 Latest Blog Posts:
━━━━━━━━━━━━━━━━━━━━━
• "Building Founder-First Ecosystems" - 2 days ago
• "Zero to One: My Startup Journey" - 1 week ago
• "AI in Indian Startups: The Reality" - 2 weeks ago
• "Community Building at Scale" - 1 month ago

Visit /blog.html for full articles`;
    },
    history: () => {
        if (commandHistory.length === 0) {
            return 'No commands in history';
        }
        return 'Command History:\n' + commandHistory.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n');
    },
    theme: (args) => {
        const theme = args ? args[0] : null;
        if (theme === 'dark' || theme === 'light') {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            return `Theme changed to ${theme}`;
        }
        return 'Usage: theme [dark/light]';
    },
    weather: async () => {
        // Simulated weather data for Hyderabad
        const weather = [
            '☀️ Sunny, 32°C',
            '⛅ Partly Cloudy, 28°C',
            '☁️ Cloudy, 26°C',
            '🌧️ Light Rain, 24°C'
        ];
        return `Weather in Hyderabad:\n${weather[Math.floor(Math.random() * weather.length)]}\nHumidity: 65%\nWind: 12 km/h`;
    },
    stats: () => {
        const visits = localStorage.getItem('visitCount') || 0;
        const commandCount = commandHistory.length;
        const uptime = Math.floor((Date.now() - (window.pageLoadTime || Date.now())) / 1000);
        
        return `📊 Website Statistics:
━━━━━━━━━━━━━━━━━━━━━
• Page Visits: ${visits}
• Commands Run: ${commandCount}
• Session Time: ${uptime}s
• Projects: 5
• Blog Posts: 12
• Events Organized: 100+`;
    },
    matrix: () => {
        const matrixChars = '01';
        let matrix = '';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 50; j++) {
                matrix += matrixChars[Math.floor(Math.random() * 2)];
            }
            matrix += '\n';
        }
        return `Entering the Matrix...\n\n${matrix}\n"There is no spoon" - The Matrix`;
    },
    whoami: () => {
        return terminalCommands.about();
    },
    admin: () => {
        window.open('/admin.html', '_blank');
        return '🔐 Opening admin panel...';
    },
    login: () => {
        window.open('/admin.html', '_blank');
        return '🔐 Redirecting to admin login...';
    },
    ls: (args) => {
        if (args && args[0] === 'projects') {
            return terminalCommands['ls projects']();
        }
        return `Available directories:\n• projects/\n• blog/\n• skills/\n• contact/`;
    },
    cat: (args) => {
        if (!args || args.length === 0) {
            return 'Usage: cat [filename]';
        }
        const file = args.join(' ').toLowerCase();
        const catCommand = `cat ${file}`;
        if (terminalCommands[catCommand]) {
            return terminalCommands[catCommand]();
        }
        return `File not found: ${file}`;
    },
    story: () => {
        return `🌱 My Journey: From Rural Roots to Tech Innovation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chapter 1: The Beginning
Born into a farming family in rural Telangana, where technology 
was a distant dream but ambition knew no bounds.

Chapter 2: The Transformation
• Self-taught programming at 16
• First website built at 17
• Founded first startup at 19
• Joined Jagriti Yatra at 20

Chapter 3: The Builder Phase
• Founded 4 startups
• Organized 100+ events
• Mentored 1000+ founders
• Built communities across 10 cities

Chapter 4: Current Mission
Building EvolveX to democratize startup ecosystems across Bharat.
Connecting rural innovators with global opportunities.

Type 'timeline' for a detailed timeline or 'mission' for my vision.`;
    },
    timeline: () => {
        const startDate = new Date('2006-01-01');
        const today = new Date();
        const daysSince = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        
        return `📅 Career Timeline (${daysSince.toLocaleString()} days and counting)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2006: Started learning computers
2010: Built first website
2015: Founded first startup
2018: Joined Jagriti Yatra movement
2019: Started CodingCubs at Anurag University
2020: Founded Feedbuzz
2021: Emergent Ventures India Fellow
2022: Launched EvolveX ecosystem
2023: Expanded to 5 cities
2024: Building AI-first solutions

⚡ Currently: ${daysSince.toLocaleString()} days of building and growing!`;
    },
    stats: () => {
        const startDate = new Date('2006-01-01');
        const today = new Date();
        const daysSince = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        
        return `📊 Live Metrics & Achievements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Building for: ${daysSince.toLocaleString()} days
🎯 Events Organized: 100+
🚀 Startups Founded: 4
👥 Founders Mentored: 1000+
🌍 Cities Connected: 10
📚 Communities Built: 5
💻 Projects Completed: 25+
✨ Lives Impacted: 10,000+

📈 Growth Rate: 200% YoY
🎯 Success Rate: 87%
⏱️ Avg Response Time: <2 hours
🔄 Active Projects: 8`;
    },
    mission: () => {
        return `🎯 My Mission & Vision
━━━━━━━━━━━━━━━━━━━━━━━━━━━

MISSION:
Democratize AI and entrepreneurship across India, especially in 
tier-2/3 cities and rural areas. Build bridges, not walls.

VISION 2030:
• Connect 1 million founders
• Enable 10,000 startups
• Create 100,000 jobs
• Bridge urban-rural divide

CORE VALUES:
• Accessibility over exclusivity
• Community over competition
• Impact over income
• Innovation over imitation

CURRENT FOCUS:
• AI democratization through EvolveX
• Rural entrepreneurship enablement
• Building sustainable ecosystems
• Creating future founders

"Zero isn't emptiness — it's infinite possibility."`;
    },
    journey: () => {
        return `🛤️ Detailed Life Journey
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌱 ROOTS (2000-2010)
Grew up in a small farming village in Telangana. First computer 
encounter at age 10 changed everything. Self-taught programming 
through borrowed books and cyber cafes.

🚀 LAUNCH (2010-2015)
Built first website for local business. Started freelancing to 
support family. Founded first startup at 19 - failed but learned.

📈 GROWTH (2015-2020)
Joined movements like Jagriti Yatra. Founded CodingCubs, elevated 
tech community at university. Launched Feedbuzz platform.

⚡ SCALE (2020-Present)
Emergent Ventures Fellow. Founded EvolveX. Organized 100+ events.
Connected ecosystems across 10 cities. Building AI-first future.

🔮 NEXT (2025-2030)
Scale to 100 cities. Enable 10,000 founders. Bridge digital divide.
Make Bharat the global innovation hub.

Type 'story' for a narrative version.`;
    }
};

// Terminal Auto-typing Animation
function typeText(element, text, speed = 30, callback) {
    if (!element) {
        // console.error('typeText: element not found');
        if (callback) callback();
        return;
    }
    
    let index = 0;
    const type = () => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            // Auto scroll to bottom
            const terminalBody = document.querySelector('.terminal-body');
            if (terminalBody) {
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    };
    type();
}

// Terminal Input Handler
function initTerminal() {
    // console.log('Initializing terminal...');
    
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    
    if (!terminalInput || !terminalOutput) {
        // console.error('Terminal elements not found:', { terminalInput, terminalOutput });
        return;
    }
    
    // console.log('Terminal elements found, starting animation...');
    
    // Clear any existing content
    terminalOutput.innerHTML = '';
    
    // Auto-type about me content on load
    const aboutSequence = [
        { command: 'whoami', delay: 1000 },
        { response: `zero [ karthik nagapuri ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ai engineer, founder, and ecosystem builder`, delay: 1500 },
        { command: 'cat story.txt', delay: 1000 },
        { response: `i grew up in a rural family of small farmers.
today, i'm building founder-first ecosystems across bharat.

i've founded 4 startups, mentored msmes, hosted 100+ startup events,
and being part of movements like jagriti yatra.

for me, zero isn't emptiness — it's infinite possibility.`, delay: 2000 },
        { command: 'ls current_work/', delay: 1000 },
        { response: `evolvex/     feedbuzz/     nexteen/     codingcubs/`, delay: 1500 }
    ];
    
    let sequenceIndex = 0;
    
    function runSequence() {
        if (sequenceIndex >= aboutSequence.length) {
            // After sequence, show prompt
            setTimeout(() => {
                const finalLine = document.createElement('div');
                finalLine.style.marginTop = '1rem';
                finalLine.style.color = 'var(--text-secondary)';
                finalLine.textContent = "type 'help' for available commands";
                terminalOutput.appendChild(finalLine);
                
                // Scroll to bottom
                const terminalBody = terminalOutput.closest('.terminal-body');
                if (terminalBody) {
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                }
            }, 500);
            return;
        }
        
        const item = aboutSequence[sequenceIndex];
        
        setTimeout(() => {
            if (item.command) {
                // Type command
                const commandLine = document.createElement('div');
                commandLine.style.marginBottom = '0.5rem';
                const prompt = document.createElement('span');
                prompt.style.color = 'var(--accent)';
                prompt.textContent = '> ';
                commandLine.appendChild(prompt);
                
                const commandText = document.createElement('span');
                commandLine.appendChild(commandText);
                terminalOutput.appendChild(commandLine);
                
                typeText(commandText, item.command, 50, () => {
                    sequenceIndex++;
                    runSequence();
                });
            } else if (item.response) {
                // Type response
                const responseLine = document.createElement('div');
                responseLine.style.marginBottom = '1rem';
                responseLine.style.whiteSpace = 'pre-wrap';
                responseLine.style.color = 'var(--text-secondary)';
                terminalOutput.appendChild(responseLine);
                
                typeText(responseLine, item.response, 20, () => {
                    sequenceIndex++;
                    runSequence();
                });
            }
        }, item.delay || 500);
    }
    
    // Start the sequence
    runSequence();
    
    // Handle user input with command history
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
            } else if (historyIndex === 0) {
                historyIndex = -1;
                terminalInput.value = '';
            }
        }
    });
    
    // Mobile-friendly input handling
    const processCommand = () => {
        const fullCommand = terminalInput.value.trim();
        const commandParts = fullCommand.split(' ');
        const command = commandParts[0].toLowerCase();
        const args = commandParts.slice(1);

        // Add to history if not empty
        if (fullCommand) {
            commandHistory.push(fullCommand);
            historyIndex = -1;
        }

        // Add command to output
        const commandLine = document.createElement('div');
        commandLine.innerHTML = `<span style="color: var(--accent)">></span> ${fullCommand}`;
        terminalOutput.appendChild(commandLine);

        // Process command
        let response;
        const fullCommandLower = fullCommand.toLowerCase();

        // Check for multi-word commands first
        if (terminalCommands[fullCommandLower]) {
            response = terminalCommands[fullCommandLower]();
        } else if (terminalCommands[command]) {
            // Handle commands with arguments
            const cmdFunc = terminalCommands[command];
            if (typeof cmdFunc === 'function') {
                response = cmdFunc(args);
            } else {
                response = cmdFunc;
            }
        } else if (command === '') {
            response = '';
        } else {
            response = `Command not found: ${command}. Type 'help' for available commands.`;
        }

        // Handle async responses (like weather)
        if (response instanceof Promise) {
            response.then(result => {
                if (result) {
                    const responseLine = document.createElement('div');
                    responseLine.style.marginBottom = '1rem';
                    responseLine.style.whiteSpace = 'pre-wrap';
                    responseLine.textContent = result;
                    terminalOutput.appendChild(responseLine);

                    // Scroll to bottom
                    const terminalBody = terminalOutput.closest('.terminal-body');
                    if (terminalBody) {
                        terminalBody.scrollTop = terminalBody.scrollHeight;
                    }
                }
            });
        } else if (response) {
            const responseLine = document.createElement('div');
            responseLine.style.marginBottom = '1rem';
            responseLine.style.whiteSpace = 'pre-wrap';
            responseLine.textContent = response;
            terminalOutput.appendChild(responseLine);
        }

        // Clear input
        terminalInput.value = '';

        // Scroll to bottom and focus
        const terminalBody = terminalOutput.closest('.terminal-body');
        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
        terminalInput.focus();
    };

    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processCommand();
        }
    });

    // Add mobile-friendly submit button for terminal
    const terminalSubmitBtn = document.createElement('button');
    terminalSubmitBtn.innerHTML = '▶';
    terminalSubmitBtn.style.cssText = `
        background: var(--accent);
        color: var(--bg);
        border: none;
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        margin-left: 0.5rem;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
        min-height: 44px;
        display: none;
    `;

    terminalSubmitBtn.addEventListener('click', processCommand);

    // Show submit button on mobile
    const checkMobile = () => {
        if (window.innerWidth <= 768) {
            terminalSubmitBtn.style.display = 'inline-flex';
            terminalSubmitBtn.style.alignItems = 'center';
            terminalSubmitBtn.style.justifyContent = 'center';
        } else {
            terminalSubmitBtn.style.display = 'none';
        }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Add submit button to terminal input line
    const terminalInputLine = document.querySelector('.terminal-input-line');
    if (terminalInputLine) {
        terminalInputLine.appendChild(terminalSubmitBtn);
    }
    
    // console.log('Terminal initialization complete');
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    const keyboardHelp = document.getElementById('keyboard-help');
    
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') {
                e.target.blur();
            }
            return;
        }
        
        switch(e.key) {
            case '?':
                if (keyboardHelp) keyboardHelp.classList.toggle('show');
                break;
            case '/':
                e.preventDefault();
                const terminalInput = document.getElementById('terminal-input');
                if (terminalInput) terminalInput.focus();
                break;
            case 't':
                toggleTheme();
                break;
            case 'h':
                window.location.href = '/';
                break;
            case 'b':
                window.location.href = '/blog';
                break;
            case 'c':
                const contactSection = document.querySelector('.contact-options');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'Escape':
                if (keyboardHelp) keyboardHelp.classList.remove('show');
                break;
        }
    });
    
    // Close keyboard help on click outside
    if (keyboardHelp) {
        keyboardHelp.addEventListener('click', (e) => {
            if (e.target === keyboardHelp) {
                keyboardHelp.classList.remove('show');
            }
        });
    }
}

// Metrics Counter Animation
function initMetricsCounters() {
    // console.log('Initializing metrics counters...');
    const metricCards = document.querySelectorAll('.metric-card[data-animate="counter"]');
    // console.log('Found metric cards:', metricCards.length);
    
    if (metricCards.length === 0) {
        console.warn('No metric cards found!');
        return;
    }
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.dataset.animate === 'counter') {
                // console.log('Animating counter for card:', entry.target);
                const number = entry.target.querySelector('.metric-number');
                if (number) {
                    // console.log('Found number element:', number, 'with target:', number.dataset.target);
                    animateCounter(number);
                } else {
                    // console.error('No .metric-number found in card:', entry.target);
                }
                entry.target.dataset.animate = 'done';
            }
        });
    }, observerOptions);
    
    metricCards.forEach(card => {
        observer.observe(card);
    });
}

function animateCounter(element) {
    console.log('Animating counter element:', element);
    const target = parseInt(element.dataset.target) || 0;
    const suffix = element.dataset.suffix || '';
    
    if (target === 0) {
        console.warn('Target is 0 for element:', element);
        return;
    }
    
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// Expandable Cards
function initExpandableCards() {
    console.log('Initializing expandable cards...');
    const expandableCards = document.querySelectorAll('.expandable-card');
    console.log('Found expandable cards:', expandableCards.length);
    
    expandableCards.forEach(card => {
        const header = card.querySelector('.expandable-header');
        const toggle = card.querySelector('.expand-toggle');
        
        if (header && toggle) {
            header.addEventListener('click', () => {
                const isExpanded = card.dataset.expanded === 'true';
                card.dataset.expanded = !isExpanded;
                toggle.textContent = isExpanded ? '[EXPAND]' : '[COLLAPSE]';
                console.log('Toggled card:', card, 'Expanded:', !isExpanded);
            });
        }
    });
}

// Days Counter
function initDaysCounter() {
    // Calculate days from your start date (adjust this date to your actual start)
    const startDate = new Date('2006-01-01'); // Approximate 18 years ago
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Update the building days counter
    const buildingCounter = document.querySelector('.metric-number[data-target="6637"]');
    if (buildingCounter) {
        buildingCounter.dataset.target = diffDays.toString();
    }
    
    // Update future days counter
    const futureDaysElements = document.querySelectorAll('.days-counter[data-days]');
    futureDaysElements.forEach(element => {
        const days = parseInt(element.dataset.days);
        element.textContent = days.toLocaleString();
    });
}

// Visitor Counter
function initVisitorCounter() {
    const visitorCount = document.getElementById('visitor-count');
    if (visitorCount) {
        // Get or set visitor count from localStorage
        let count = parseInt(localStorage.getItem('totalVisitors') || '1000');
        
        // Check if this is a new visitor
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        
        if (lastVisit !== today) {
            count++;
            localStorage.setItem('totalVisitors', count.toString());
            localStorage.setItem('lastVisit', today);
        }
        
        // Animate the counter
        let current = count - 50;
        const increment = 1;
        const timer = setInterval(() => {
            current += increment;
            if (current >= count) {
                current = count;
                clearInterval(timer);
            }
            visitorCount.textContent = current.toLocaleString();
        }, 30);
    }
}

// Engagement Tracking
function initEngagementTracking() {
    // Track time spent on page
    const startTime = Date.now();
    let timeSpent = 0;
    
    // Update time spent every second
    setInterval(() => {
        timeSpent = Math.floor((Date.now() - startTime) / 1000);
        localStorage.setItem('timeSpent', timeSpent.toString());
    }, 1000);
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercentage > maxScroll) {
            maxScroll = scrollPercentage;
            localStorage.setItem('maxScroll', maxScroll.toString());
        }
    });
    
    // Track terminal usage
    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput) {
        let commandCount = parseInt(localStorage.getItem('commandCount') || '0');
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && terminalInput.value.trim()) {
                commandCount++;
                localStorage.setItem('commandCount', commandCount.toString());
            }
        });
    }
    
    // Add Easter egg for engaged users
    if (parseInt(localStorage.getItem('commandCount') || '0') > 10) {
        // Add special easter egg command
        terminalCommands.easter = () => {
            return `🎆 Easter Egg Unlocked!
━━━━━━━━━━━━━━━━━━━━━━━━━

You're a power user! Here are some secret commands:
• matrix - Enter the matrix
• konami - Try the Konami code
• zen - Zen mode
• coffee - Virtual coffee
• inspire - Get inspired

Your engagement stats:
• Commands typed: ${localStorage.getItem('commandCount')}
• Time spent: ${Math.floor(parseInt(localStorage.getItem('timeSpent') || '0') / 60)} minutes
• Scroll depth: ${Math.floor(parseFloat(localStorage.getItem('maxScroll') || '0'))}%

🎉 Thanks for exploring!`;
        };
        
        // Add matrix command
        terminalCommands.matrix = () => {
            const matrix = document.createElement('div');
            matrix.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: black;
                color: #0f0;
                font-family: monospace;
                z-index: 9999;
                overflow: hidden;
                pointer-events: none;
            `;
            
            const chars = '01';
            const columns = Math.floor(window.innerWidth / 20);
            const drops = Array(columns).fill(0);
            
            document.body.appendChild(matrix);
            
            const interval = setInterval(() => {
                matrix.innerHTML = '';
                for (let i = 0; i < columns; i++) {
                    const text = document.createElement('span');
                    text.style.cssText = `
                        position: absolute;
                        left: ${i * 20}px;
                        top: ${drops[i] * 20}px;
                        font-size: 20px;
                    `;
                    text.textContent = chars[Math.floor(Math.random() * chars.length)];
                    matrix.appendChild(text);
                    
                    if (drops[i] * 20 > window.innerHeight && Math.random() > 0.95) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }, 50);
            
            setTimeout(() => {
                clearInterval(interval);
                matrix.remove();
            }, 5000);
            
            return 'Entering the Matrix... (5 seconds)';
        };
    }
}

// Timeline Animation
function initTimelineAnimation() {
    console.log('Initializing timeline animation...');
    const timelineItems = document.querySelectorAll('.timeline-item');
    console.log('Found timeline items:', timelineItems.length);
    
    if (timelineItems.length === 0) {
        console.warn('No timeline items found!');
        return;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Animating timeline item:', entry.target);
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe timeline items
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
}

// Typing Animation for Hero Text
function initTypingAnimation() {
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach(element => {
        const text = element.getAttribute('data-text') || element.textContent;
        element.textContent = '';
        let index = 0;
        
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, 100);
            }
        };
        
        // Start typing after a short delay
        setTimeout(type, 500);
    });
}

// Track page load time for stats
window.pageLoadTime = Date.now();

// Mobile Navigation Toggle
function initMobileNavigation() {
    // console.log('Initializing mobile navigation...');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!navToggle || !navLinks) {
        // console.warn('Mobile navigation elements not found');
        return;
    }

    // Add mobile-menu class for styling
    // navLinks.classList.add('mobile-menu'); // Commented out to fix duplication issue

    navToggle.addEventListener('click', () => {
        const isActive = navToggle.classList.contains('active');

        if (isActive) {
            // Close menu
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        } else {
            // Open menu
            navToggle.classList.add('active');
            navLinks.classList.add('active');
        }
    });

    // Close menu when clicking on a link
    navLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    console.log('Mobile navigation initialized');
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing...');

    // Track visitor count
    let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    visitCount++;
    localStorage.setItem('visitCount', visitCount.toString());

    // Initialize theme
    initTheme();

    // Setup theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Initialize features
    try {
        initMobileNavigation();
        initTerminal();
        initKeyboardShortcuts();
        initTypingAnimation();

        // console.log('Initializing features...');
        // Removed: initMetricsCounters();
        initExpandableCards();
        initDaysCounter();
        initVisitorCounter();
        initEngagementTracking();
        // Removed: initTimelineAnimation();
        // console.log('Features initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Add active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Contact form handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message'),
                timestamp: new Date().toISOString()
            };
            
            // Store in localStorage (in production, send to backend)
            const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            messages.push(data);
            localStorage.setItem('contact_messages', JSON.stringify(messages));
            
            // Show success message
            const statusDiv = document.getElementById('contact-form-status');
            statusDiv.style.display = 'block';
            statusDiv.style.color = 'var(--success)';
            statusDiv.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
            
            // Reset form
            contactForm.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
            
            // Log to console (in production, send to email service)
            console.log('Contact form submission:', data);
        });
    }
    
    console.log('Initialization complete');
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed:', err);
                });
        });
    }
});

// Export for global use
window.toggleTheme = toggleTheme;