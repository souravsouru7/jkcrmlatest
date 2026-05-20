document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enabled');

    // 1. CUSTOM CURSOR
    const cursor = document.getElementById('cursor');
    const cursorRing = document.getElementById('cursor-ring');

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant cursor move
        cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
    });

    // Lagging ring animation
    const animateRing = () => {
        const lerp = 0.12;
        ringX += (mouseX - ringX) * lerp;
        ringY += (mouseY - ringY) * lerp;

        cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
        requestAnimationFrame(animateRing);
    };
    animateRing();

    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .why-card, .work-tile, input, select, textarea');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '18px';
            cursor.style.height = '18px';
            cursor.style.transform = `translate(${mouseX - 9}px, ${mouseY - 9}px)`;
            cursorRing.style.borderColor = 'rgba(176, 137, 104, 0.8)';
            cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px) scale(1.5)`;
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '10px';
            cursor.style.height = '10px';
            cursorRing.style.borderColor = 'rgba(176, 137, 104, 0.55)';
            cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px) scale(1)`;
        });
    });

    // 2. NAVBAR SCROLL STATE
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. SCROLL REVEAL
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. STAT COUNTER ANIMATION
    const stats = document.querySelectorAll('.stat-num');
    const statSection = document.querySelector('.hero-stats');
    let animated = false;

    const animateStats = () => {
        stats.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const duration = 1400;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentVal = (easedProgress * target).toFixed(target % 1 === 0 ? 0 : 1);

                let suffix = '';
                if (stat.id === 'stat-exp' || stat.id === 'stat-projects') suffix = '+';
                else if (stat.id === 'stat-sat') suffix = '%';

                stat.textContent = currentVal + (progress === 1 ? suffix : '');

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            requestAnimationFrame(update);
        });
    };

    const statObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !animated) {
            animateStats();
            animated = true;
        }
    }, { threshold: 0.5 });

    if (statSection) statObserver.observe(statSection);

    // 5. SMOOTH ANCHOR SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offset = 72;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. ACTIVE NAV HIGHLIGHT
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 7. UTM CAPTURE & POPULATION
    const getUTMParams = () => {
        const params = new URLSearchParams(window.location.search);
        const utms = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'utm_adgroup', 'utm_matchtype', 'utm_device', 'utm_ad', 'srd',
            'gad_source', 'gad_campaignid', 'gbraid', 'gclid'
        ];
        
        utms.forEach(utm => {
            if (params.has(utm)) {
                sessionStorage.setItem(utm, params.get(utm));
            }
        });
        
        return utms.reduce((acc, utm) => {
            acc[utm] = sessionStorage.getItem(utm) || '';
            return acc;
        }, {});
    };

    const utmData = getUTMParams();
    
    // Populate hidden fields in all forms
    document.querySelectorAll('form').forEach(form => {
        const utms = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'utm_adgroup', 'utm_matchtype', 'utm_device', 'utm_ad', 'srd',
            'gad_source', 'gad_campaignid', 'gbraid', 'gclid'
        ];
        utms.forEach(utm => {
            const hiddenInput = form.querySelector(`input[name="${utm}"]`);
            if (hiddenInput && utmData[utm]) {
                hiddenInput.value = utmData[utm];
            }
        });
    });

    // 8. PHONE NUMBER VALIDATION
    const phoneInputs = document.querySelectorAll('.phone-input');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove non-numeric characters
            let value = this.value.replace(/\D/g, '');
            
            // Ensure first digit is 6, 7, 8, or 9
            if (value.length > 0 && !/^[6-9]/.test(value)) {
                value = value.substring(1);
            }
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            
            this.value = value;
        });
    });

    // 9. FORM SUBMISSION HANDLING (Fetch & Redirect)
    const forms = document.querySelectorAll('form');
    // NOTE: Replace with the actual Google Apps Script web app URL once deployed
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; 

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;

            // Optional: Final phone length check
            const phoneField = form.querySelector('.phone-input');
            if (phoneField && phoneField.value.length !== 10) {
                alert("Please enter a valid 10-digit phone number.");
                return;
            }

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Temporary mock for visual effect if script URL isn't set yet
            if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                console.warn('Google Script URL not configured. Simulating submission.');
                setTimeout(() => {
                    if (data.email) sessionStorage.setItem('submittedEmail', data.email);
                    window.location.href = 'thank-you.html';
                }, 1000);
                return;
            }

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                // Using text/plain to avoid CORS preflight issues with Google Apps Script
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                }
            })
            .then(response => response.json())
            .then(result => {
                submitBtn.textContent = '✦ Redirecting...';
                
                // Store email in sessionStorage for Thank You page Enhanced Tracking
                if (data.email) {
                    sessionStorage.setItem('submittedEmail', data.email);
                }

                // Redirect to Thank You Page
                window.location.href = 'thank-you.html';
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert("There was an error submitting the form. Please try again.");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    });

    // 8. TESTIMONIAL SLIDER
    const slider = document.getElementById('test-slider');
    const prevBtn = document.getElementById('prev-test');
    const nextBtn = document.getElementById('next-test');
    const dots = document.querySelectorAll('#test-dots .dot');

    if (slider) {
        const updateDots = () => {
            const index = Math.round(slider.scrollLeft / slider.offsetWidth);
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        slider.addEventListener('scroll', updateDots);

        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -slider.offsetWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
        });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                slider.scrollTo({ left: i * slider.offsetWidth, behavior: 'smooth' });
            });
        });
    }
});
