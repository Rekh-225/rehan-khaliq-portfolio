document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Year Setup
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // 2. Navigation, Scrolling & Active Section Tracking
    const nav = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('backToTop');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        const scrollY = window.scrollY;

        // Nav scrolled state: adds shadow/bg change
        if (scrollY > 50) {
            nav?.classList.add('scrolled');
        } else {
            nav?.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (backToTopBtn) {
            if (scrollY > 500) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        }

        // Active section tracking
        let current = '';
        const navHeight = nav ? nav.offsetHeight : 80;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Buffer to account for nav height and early trigger
            if (scrollY >= (sectionTop - navHeight - 100)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check on load

    // Smooth Scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = nav ? nav.offsetHeight : 80;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if it is open
                if (navLinksContainer && hamburger) {
                    navLinksContainer.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // 3. Mobile Menu Toggle
    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // Back to top click
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. Scroll Reveal Animations (IntersectionObserver)
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Only trigger once
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 5. Project Filtering with Stagger Animation
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0 && projectCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));

                const filterValue = btn.getAttribute('data-filter');
                let delay = 0;

                projectCards.forEach(card => {
                    // Reset visibility & animation classes
                    card.style.display = 'none';
                    card.classList.remove('show');
                    
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        
                        // Apply stagger animation
                        setTimeout(() => {
                            card.classList.add('show');
                        }, delay);
                        delay += 100; // 100ms delay per card
                    }
                });
            });
        });
        
        // Initial setup to show cards on load
        let initDelay = 0;
        projectCards.forEach(card => {
            card.style.display = 'block';
            setTimeout(() => {
                card.classList.add('show');
            }, initDelay);
            initDelay += 100;
        });
    }

    // 6. Typing Effect (Hero Section)
    const typingTextEl = document.querySelector('.typing-text');
    if (typingTextEl) {
        const words = ['AI & Machine Learning', 'Backend Engineering', 'Cloud Infrastructure', 'Cybersecurity', 'Research & Documentation'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        const type = () => {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingTextEl.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50; // Deleting is faster
            } else {
                typingTextEl.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typeSpeed = 2000; // Pause at end of word
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500; // Pause before typing new word
            }

            setTimeout(type, typeSpeed);
        };

        // Start typing after a short delay
        setTimeout(type, 1000);
    }

    // 7. Counter Animation (About Section stats)
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const startCounters = () => {
        statNumbers.forEach(stat => {
            const targetStr = stat.getAttribute('data-count');
            const target = parseFloat(targetStr);
            const suffix = stat.getAttribute('data-suffix') || '';
            if (isNaN(target)) return;

            const duration = 2000; // 2 seconds
            let startTimestamp = null;
            // Check if there's a decimal in the attribute value
            const isDecimal = targetStr.includes('.');

            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentCount = progress * target;
                
                if (isDecimal) {
                    stat.textContent = currentCount.toFixed(2) + suffix;
                } else {
                    stat.textContent = Math.floor(currentCount) + suffix;
                }

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    stat.textContent = (isDecimal ? target.toFixed(2) : target) + suffix;
                }
            };
            
            window.requestAnimationFrame(step);
        });
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                startCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% visible

    // We can observe the stats container or individual numbers
    const statsContainer = document.querySelector('.stats-container, #about');
    if (statsContainer && statNumbers.length > 0) {
        counterObserver.observe(statsContainer);
    } else if (statNumbers.length > 0) {
        statNumbers.forEach(stat => counterObserver.observe(stat));
    }
});
