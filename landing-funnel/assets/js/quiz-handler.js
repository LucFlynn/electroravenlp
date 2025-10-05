/**
 * Quiz Handler - The Testing Engine Lead Generation Funnel
 * Handles quiz navigation, answer storage, score calculation, and form submission
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const quizState = {
    currentQuestion: 1,
    totalQuestions: 6,
    answers: {
        bottleneck: '',
        launchSpeed: '',
        clientCount: '',
        adSpend: '',
        frustrationLevel: ''
    },
    score: 0,
    contactInfo: {
        name: '',
        email: '',
        company: '',
        phone: '',
        newsletter: false
    }
};

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Replace with your actual Formspree endpoint
    formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',

    // Replace with your actual Formspree endpoint for exit popup
    formspreeExitEndpoint: 'https://formspree.io/f/YOUR_EXIT_FORM_ID',

    // Results page URL
    resultsPage: 'results.html',

    // Thank you page URL
    thankYouPage: 'thank-you.html'
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    progressPercent: document.getElementById('progress-percent'),
    backBtn: document.getElementById('back-btn'),
    nextBtn: document.getElementById('next-btn'),
    leadForm: document.getElementById('lead-form'),
    exitModal: document.getElementById('exit-modal'),
    exitForm: document.getElementById('exit-form'),
    loadingOverlay: document.getElementById('loading-overlay'),
    navButtons: document.getElementById('nav-buttons')
};

// ============================================
// QUIZ NAVIGATION
// ============================================

/**
 * Show a specific question
 */
function showQuestion(questionNumber) {
    // Hide all questions
    document.querySelectorAll('.quiz-question').forEach(q => {
        q.classList.remove('active');
        q.classList.add('hidden');
    });

    // Show target question
    const targetQuestion = document.querySelector(`[data-question="${questionNumber}"]`);
    if (targetQuestion) {
        targetQuestion.classList.remove('hidden');
        targetQuestion.classList.add('active');
    }

    // Update state
    quizState.currentQuestion = questionNumber;

    // Update UI
    updateProgress();
    updateNavigationButtons();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Update progress bar and text
 */
function updateProgress() {
    const percentage = (quizState.currentQuestion / quizState.totalQuestions) * 100;

    elements.progressBar.style.width = percentage + '%';
    elements.progressText.textContent = `Question ${quizState.currentQuestion} of ${quizState.totalQuestions}`;
    elements.progressPercent.textContent = Math.round(percentage) + '%';
}

/**
 * Update navigation button states
 */
function updateNavigationButtons() {
    // Back button
    elements.backBtn.disabled = quizState.currentQuestion === 1;

    // Next button
    if (quizState.currentQuestion === quizState.totalQuestions) {
        // Last question (lead form) - hide next button
        elements.nextBtn.style.display = 'none';
    } else {
        elements.nextBtn.style.display = 'block';

        // Check if current question is answered
        const isAnswered = checkCurrentQuestionAnswered();
        elements.nextBtn.disabled = !isAnswered;
    }
}

/**
 * Check if current question has been answered
 */
function checkCurrentQuestionAnswered() {
    const currentQuestionEl = document.querySelector(`[data-question="${quizState.currentQuestion}"]`);
    if (!currentQuestionEl) return false;

    const selectedCard = currentQuestionEl.querySelector('.answer-card.selected');
    return selectedCard !== null;
}

/**
 * Go to next question
 */
function nextQuestion() {
    if (quizState.currentQuestion < quizState.totalQuestions) {
        showQuestion(quizState.currentQuestion + 1);

        // Track quiz progress
        if (quizState.currentQuestion === 2 && typeof trackQuizStarted === 'function') {
            trackQuizStarted();
        }
    }
}

/**
 * Go to previous question
 */
function previousQuestion() {
    if (quizState.currentQuestion > 1) {
        showQuestion(quizState.currentQuestion - 1);
    }
}

// ============================================
// ANSWER SELECTION
// ============================================

/**
 * Handle answer card click
 */
function handleAnswerClick(event) {
    const card = event.currentTarget;
    const questionEl = card.closest('.quiz-question');
    const questionNum = parseInt(questionEl.dataset.question);

    // Remove selection from siblings
    questionEl.querySelectorAll('.answer-card').forEach(c => {
        c.classList.remove('selected');
    });

    // Add selection to clicked card
    card.classList.add('selected');

    // Store answer
    storeAnswer(questionNum, card);

    // Update navigation
    updateNavigationButtons();

    // Auto-advance after short delay (except for last question)
    if (questionNum < quizState.totalQuestions) {
        setTimeout(() => {
            nextQuestion();
        }, 300);
    }
}

/**
 * Store answer and calculate score
 */
function storeAnswer(questionNum, card) {
    const value = card.dataset.value;
    const points = parseInt(card.dataset.points) || 0;

    // Map question number to answer key
    const answerKeys = {
        1: 'bottleneck',
        2: 'launchSpeed',
        3: 'clientCount',
        4: 'adSpend',
        5: 'frustrationLevel'
    };

    const key = answerKeys[questionNum];
    if (key) {
        // Remove old score if answer was previously selected
        if (quizState.answers[key]) {
            const oldCard = document.querySelector(`[data-question="${questionNum}"] [data-value="${quizState.answers[key]}"]`);
            if (oldCard) {
                const oldPoints = parseInt(oldCard.dataset.points) || 0;
                quizState.score -= oldPoints;
            }
        }

        // Store new answer and add points
        quizState.answers[key] = value;
        quizState.score += points;
    }
}

// ============================================
// FORM SUBMISSION
// ============================================

/**
 * Handle lead form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    quizState.contactInfo = {
        name: formData.get('full-name'),
        email: formData.get('email'),
        company: formData.get('company') || '',
        phone: formData.get('phone') || '',
        newsletter: formData.get('newsletter') === 'on'
    };

    // Show loading overlay
    elements.loadingOverlay.classList.remove('hidden');

    // Prepare submission data
    const submissionData = {
        // Contact info
        name: quizState.contactInfo.name,
        email: quizState.contactInfo.email,
        company: quizState.contactInfo.company,
        phone: quizState.contactInfo.phone,
        newsletter: quizState.contactInfo.newsletter,

        // Quiz answers
        bottleneck: quizState.answers.bottleneck,
        launchSpeed: quizState.answers.launchSpeed,
        clientCount: quizState.answers.clientCount,
        adSpend: quizState.answers.adSpend,
        frustrationLevel: quizState.answers.frustrationLevel,

        // Score
        score: quizState.score,

        // Metadata
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
    };

    try {
        // Submit to Formspree
        const response = await fetch(CONFIG.formspreeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(submissionData)
        });

        if (response.ok) {
            // Track conversion
            if (typeof trackQuizCompleted === 'function') {
                trackQuizCompleted();
            }

            // Redirect to results page with score
            const params = new URLSearchParams({
                score: quizState.score,
                bottleneck: quizState.answers.bottleneck,
                launchSpeed: quizState.answers.launchSpeed,
                clientCount: quizState.answers.clientCount,
                adSpend: quizState.answers.adSpend,
                frustrationLevel: quizState.answers.frustrationLevel,
                email: quizState.contactInfo.email
            });

            window.location.href = `${CONFIG.resultsPage}?${params.toString()}`;
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        elements.loadingOverlay.classList.add('hidden');
        alert('There was an error submitting your form. Please try again.');
    }
}

// ============================================
// EXIT INTENT POPUP
// ============================================

let exitIntentShown = false;

/**
 * Show exit intent modal
 */
function showExitModal() {
    if (!exitIntentShown && !sessionStorage.getItem('exitModalShown')) {
        elements.exitModal.classList.remove('hidden');
        exitIntentShown = true;
        sessionStorage.setItem('exitModalShown', 'true');

        // Track event
        if (typeof trackExitPopupShown === 'function') {
            trackExitPopupShown();
        }
    }
}

/**
 * Close exit intent modal
 */
function closeExitModal() {
    elements.exitModal.classList.add('hidden');
}

/**
 * Handle exit form submission
 */
async function handleExitFormSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('exit-email').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const submissionData = {
        email: email,
        type: 'exit-intent',
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(CONFIG.formspreeExitEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(submissionData)
        });

        if (response.ok) {
            // Track event
            if (typeof trackExitPopupConverted === 'function') {
                trackExitPopupConverted();
            }

            // Show success message
            submitBtn.textContent = 'Sent! Check Your Email';
            submitBtn.classList.remove('gradient-button');
            submitBtn.classList.add('bg-green-600');

            // Close modal after delay
            setTimeout(() => {
                closeExitModal();
            }, 2000);
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error submitting exit form:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Error - Try Again';
        submitBtn.classList.add('bg-red-600');

        setTimeout(() => {
            submitBtn.textContent = 'Send Me the Guide';
            submitBtn.classList.remove('bg-red-600');
            submitBtn.classList.add('gradient-button');
        }, 3000);
    }
}

/**
 * Detect exit intent
 */
function handleMouseLeave(event) {
    // Only trigger if mouse is leaving at the top of the page
    if (event.clientY <= 0) {
        showExitModal();
    }
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================

function handleScroll() {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('header-blur');
    } else {
        header.classList.remove('header-blur');
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Quiz Handler Initialized');

    // Set up answer card click handlers
    document.querySelectorAll('.answer-card').forEach(card => {
        card.addEventListener('click', handleAnswerClick);
    });

    // Set up navigation buttons
    elements.backBtn.addEventListener('click', previousQuestion);
    elements.nextBtn.addEventListener('click', nextQuestion);

    // Set up lead form submission
    if (elements.leadForm) {
        elements.leadForm.addEventListener('submit', handleFormSubmit);
    }

    // Set up exit form submission
    if (elements.exitForm) {
        elements.exitForm.addEventListener('submit', handleExitFormSubmit);
    }

    // Set up exit intent detection
    document.addEventListener('mouseleave', handleMouseLeave);

    // Set up header scroll effect
    window.addEventListener('scroll', handleScroll);

    // Initialize first question
    updateProgress();
    updateNavigationButtons();
});

// ============================================
// GLOBAL FUNCTIONS (for external use)
// ============================================

// Make closeExitModal available globally for onclick handler
window.closeExitModal = closeExitModal;
