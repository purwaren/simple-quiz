/**
 * Visual Explorer Quiz Portal Engine (V2 - Mobile Optimized)
 */

let allQuizzes = [];
let selectedQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let userName = "";
let userClass = "";
let userAnswers = [];
let tapSelectedOption = null;

// DOM Elements
const landingPage = document.getElementById('landing-page');
const quizList = document.getElementById('quiz-list');
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionContainer = document.getElementById('question-container');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');
const backToLandingBtn = document.getElementById('back-to-landing');

// Initialize
async function init() {
    try {
        const response = await fetch('quizzes/index.json');
        allQuizzes = await response.json();
        renderLandingPage();
    } catch (error) {
        console.error("Error loading quiz index:", error);
    }
}

// Render Landing Page
function renderLandingPage() {
    landingPage.classList.remove('hidden');
    quizList.innerHTML = '';

    const categories = {};
    allQuizzes.forEach(quiz => {
        const cat = quiz.category || 'Lainnya';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(quiz);
    });

    Object.entries(categories).forEach(([catName, quizzes], catIdx) => {
        const heading = document.createElement('div');
        heading.className = `col-span-full text-left text-xl font-fredoka text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100${catIdx > 0 ? ' mt-6' : ''}`;
        heading.innerText = catName;
        quizList.appendChild(heading);

        quizzes.forEach(quiz => {
            const card = document.createElement('div');
            card.className = 'quiz-card bg-white p-8 rounded-3xl shadow-lg text-left cursor-pointer hover:shadow-xl transition border-2 border-transparent hover:border-blue-400 group';
            card.innerHTML = `
                <div class="text-5xl mb-4 group-hover:scale-110 transition duration-300">${quiz.icon}</div>
                <h3 class="text-2xl font-fredoka text-slate-800 mb-2">${quiz.title}</h3>
                <p class="text-slate-500 text-sm leading-relaxed">${quiz.description}</p>
            `;
            card.onclick = () => selectQuiz(quiz);
            quizList.appendChild(card);
        });
    });
}

// Select Quiz
async function selectQuiz(quizMetadata) {
    try {
        const response = await fetch(quizMetadata.file);
        selectedQuiz = await response.json();
        
        landingPage.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        document.getElementById('selected-quiz-title').innerText = selectedQuiz.quiz_title;
    } catch (error) {
        console.error("Error loading quiz data:", error);
        alert("Gagal memuat kuis. Silakan coba lagi.");
    }
}

// Back to Landing
backToLandingBtn.onclick = () => {
    welcomeScreen.classList.add('hidden');
    landingPage.classList.remove('hidden');
};

// Start Quiz
startBtn.addEventListener('click', () => {
    userName = document.getElementById('user-name').value.trim();
    userClass = document.getElementById('user-class').value.trim();

    if (!userName || !userClass) {
        alert("Harap masukkan Nama dan Kelas ya!");
        return;
    }

    welcomeScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    renderQuestion();
});

// Render Question
function renderQuestion() {
    const question = selectedQuiz.questions[currentQuestionIndex];
    questionContainer.innerHTML = '';
    nextBtn.disabled = true;
    tapSelectedOption = null;

    // Update Progress
    const progress = ((currentQuestionIndex) / selectedQuiz.questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.innerText = `Soal ${currentQuestionIndex + 1} dari ${selectedQuiz.questions.length}`;

    const questionTitle = document.createElement('h2');
    questionTitle.className = 'text-xl md:text-2xl font-bold text-slate-800 mb-6 leading-tight';
    questionTitle.innerText = question.question;
    questionContainer.appendChild(questionTitle);

    if (question.type === 'multiple-choice') {
        renderMultipleChoice(question);
    } else if (question.type === 'drag-drop') {
        renderTapToPlace(question);
    } else if (question.type === 'matching') {
        renderMatching(question);
    }
}

// Type 1: Multiple Choice
function renderMultipleChoice(question) {
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4';

    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'p-5 md:p-6 text-left border-2 border-slate-100 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition font-bold text-slate-700 active:bg-blue-100';
        btn.innerText = opt;
        btn.onclick = () => {
            userAnswers[currentQuestionIndex] = index;
            nextBtn.disabled = false;
            Array.from(optionsGrid.children).forEach(child => child.classList.remove('border-blue-500', 'bg-blue-100'));
            btn.classList.add('border-blue-500', 'bg-blue-100');
        };
        optionsGrid.appendChild(btn);
    });

    questionContainer.appendChild(optionsGrid);
}

// Type 2: Tap-to-Place (Replacing Drag-and-Drop)
function renderTapToPlace(question) {
    const container = document.createElement('div');
    container.className = 'space-y-8';

    // Sentence with blank
    const sentenceParts = question.sentence.split('_______');
    const sentenceEl = document.createElement('p');
    sentenceEl.className = 'text-lg md:text-xl text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100';
    sentenceEl.innerHTML = `${sentenceParts[0]} <span id="drop-zone" class="drop-zone mx-1">...</span> ${sentenceParts[1]}`;
    container.appendChild(sentenceEl);

    // Options to tap
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'flex flex-wrap gap-3';
    
    question.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'bg-white border-2 border-slate-200 px-5 py-3 rounded-xl shadow-sm font-bold text-slate-600 hover:border-blue-300 active:scale-95 transition';
        btn.innerText = opt;
        
        btn.onclick = () => {
            tapSelectedOption = opt;
            Array.from(optionsContainer.children).forEach(b => b.classList.remove('selected-option'));
            btn.classList.add('selected-option');
        };
        
        optionsContainer.appendChild(btn);
    });
    
    container.appendChild(optionsContainer);
    questionContainer.appendChild(container);

    const dropZone = document.getElementById('drop-zone');
    dropZone.onclick = () => {
        if (tapSelectedOption) {
            dropZone.innerText = tapSelectedOption;
            dropZone.classList.add('filled');
            userAnswers[currentQuestionIndex] = tapSelectedOption;
            nextBtn.disabled = false;
        } else {
            alert("Pilih salah satu jawaban di bawah dulu ya!");
        }
    };
}

// Type 3: Matching (Tap to Match)
function renderMatching(question) {
    const container = document.createElement('div');
    container.className = 'grid grid-cols-2 gap-4 md:gap-8';

    const leftCol = document.createElement('div');
    leftCol.className = 'space-y-3';
    const rightCol = document.createElement('div');
    rightCol.className = 'space-y-3';

    let selectedLeft = null;
    let matches = {};

    question.left.forEach(item => {
        const el = document.createElement('button');
        el.className = 'w-full flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl transition font-bold text-3xl md:text-5xl h-[160px] md:h-[260px] shadow-sm overflow-hidden';
        
        let contentHTML = '';
        // Image container with fixed height
        contentHTML += `<div class="h-24 md:h-36 w-full flex items-center justify-center mb-2 flex-shrink-0">`;
        if (item.image) {
            contentHTML += `<img src="${item.image}" class="max-h-full max-w-full object-contain rounded" alt="Image">`;
        }
        contentHTML += `</div>`;
        
        // Text container with flexible growth but centered
        if (item.text) {
            contentHTML += `<div class="flex-grow flex items-center justify-center w-full min-h-0">
                                <span class="text-center leading-tight truncate-multiline">${item.text}</span>
                            </div>`;
        }
        el.innerHTML = contentHTML;

        el.onclick = () => {
            selectedLeft = item.id;
            Array.from(leftCol.children).forEach(c => c.classList.remove('selected-option'));
            el.classList.add('selected-option');
        };
        leftCol.appendChild(el);
    });

    question.right.forEach(item => {
        const el = document.createElement('button');
        el.className = 'w-full flex flex-col items-center justify-center relative p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl transition font-bold text-xl md:text-3xl h-[160px] md:h-[260px] shadow-sm overflow-hidden';
        
        let contentHTML = '';
        // Image container with fixed height
        contentHTML += `<div class="h-24 md:h-36 w-full flex items-center justify-center mb-2 flex-shrink-0">`;
        if (item.image) {
            contentHTML += `<img src="${item.image}" class="max-h-full max-w-full object-contain rounded" alt="Image">`;
        }
        contentHTML += `</div>`;
        
        // Text container with flexible growth but centered
        if (item.text) {
            contentHTML += `<div class="flex-grow flex items-center justify-center w-full min-h-0">
                                <span class="text-center leading-tight z-10 relative">${item.text}</span>
                            </div>`;
        }
        el.innerHTML = contentHTML;

        el.onclick = () => {
            if (selectedLeft) {
                matches[selectedLeft] = item.id;
                el.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
                
                // Add Checkmark Overlay
                const check = document.createElement('div');
                check.innerHTML = '✓';
                check.className = 'absolute top-1 right-2 text-green-600 font-black text-2xl z-20';
                el.appendChild(check);
                
                el.disabled = true;
                
                if (Object.keys(matches).length === question.left.length) {
                    userAnswers[currentQuestionIndex] = matches;
                    nextBtn.disabled = false;
                }
                
                // Mark left as completed
                Array.from(leftCol.children).forEach(c => {
                    if (c.classList.contains('selected-option')) {
                        c.classList.remove('selected-option');
                        c.classList.add('bg-green-50', 'border-green-200', 'text-slate-400', 'opacity-60');
                        c.disabled = true;
                    }
                });
                selectedLeft = null;
            } else {
                alert("Pilih kotak di sebelah kiri dulu ya!");
            }
        };
        rightCol.appendChild(el);
    });

    container.appendChild(leftCol);
    container.appendChild(rightCol);
    questionContainer.appendChild(container);
}

// Navigation
nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
    }
});

// Show Results
function showResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    calculateScore();
    
    document.getElementById('display-name').innerText = userName;
    document.getElementById('final-score').innerText = Math.round(score);
}

function calculateScore() {
    let totalCorrect = 0;
    selectedQuiz.questions.forEach((q, index) => {
        const userAns = userAnswers[index];
        if (q.type === 'multiple-choice') {
            if (userAns === q.answer) totalCorrect++;
        } else if (q.type === 'drag-drop') {
            if (userAns === q.answer) totalCorrect++;
        } else if (q.type === 'matching') {
            let correctPairs = 0;
            for (let key in q.pairs) {
                if (userAns[key] === q.pairs[key]) correctPairs++;
            }
            if (correctPairs === Object.keys(q.pairs).length) totalCorrect++;
        }
    });
    
    score = (totalCorrect / selectedQuiz.questions.length) * 100;
}

// Certificate Generation
document.getElementById('download-cert').addEventListener('click', () => {
    generateCertificate();
});

function generateCertificate() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1123;
    canvas.height = 794;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 30;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e293b';
    
    ctx.font = 'bold 60px sans-serif';
    ctx.fillText('SERTIFIKAT PENGHARGAAN', canvas.width / 2, 200);
    ctx.font = '30px sans-serif';
    ctx.fillText('Diberikan kepada:', canvas.width / 2, 280);
    ctx.font = 'bold 80px sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText(userName.toUpperCase(), canvas.width / 2, 380);
    ctx.font = '30px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Dari Kelas ${userClass}`, canvas.width / 2, 440);
    ctx.font = '24px sans-serif';
    ctx.fillText('Atas keberhasilannya menyelesaikan tantangan kuis:', canvas.width / 2, 520);
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(selectedQuiz.quiz_title, canvas.width / 2, 580);
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText(`SKOR: ${Math.round(score)}/100`, canvas.width / 2, 680);
    
    const date = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(date, canvas.width / 2, 740);

    const link = document.createElement('a');
    link.download = `Sertifikat_${userName}_${userClass}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
