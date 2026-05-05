/**
 * Visual Explorer Quiz Portal Engine
 */

let quizData = null;
let currentQuestionIndex = 0;
let score = 0;
let userName = "";
let userClass = "";
let userAnswers = [];

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionContainer = document.getElementById('question-container');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');

// Initialize
async function init() {
    try {
        const response = await fetch('questions.json');
        quizData = await response.json();
        console.log("Quiz loaded:", quizData.quiz_title);
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

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
    const question = quizData.questions[currentQuestionIndex];
    questionContainer.innerHTML = '';
    nextBtn.disabled = true;

    // Update Progress
    const progress = ((currentQuestionIndex) / quizData.questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.innerText = `Soal ${currentQuestionIndex + 1} dari ${quizData.questions.length}`;

    const questionTitle = document.createElement('h2');
    questionTitle.className = 'text-2xl font-bold text-slate-800 mb-6';
    questionTitle.innerText = question.question;
    questionContainer.appendChild(questionTitle);

    if (question.type === 'multiple-choice') {
        renderMultipleChoice(question);
    } else if (question.type === 'drag-drop') {
        renderDragDrop(question);
    } else if (question.type === 'matching') {
        renderMatching(question);
    }
}

// Type 1: Multiple Choice
function renderMultipleChoice(question) {
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';

    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-card p-6 text-left border-2 border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition font-bold text-slate-700';
        btn.innerText = opt;
        btn.onclick = () => {
            selectOption(index);
            // Clear other selections
            Array.from(optionsGrid.children).forEach(child => child.classList.remove('border-blue-500', 'bg-blue-100'));
            btn.classList.add('border-blue-500', 'bg-blue-100');
        };
        optionsGrid.appendChild(btn);
    });

    questionContainer.appendChild(optionsGrid);
}

function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;
    nextBtn.disabled = false;
}

// Type 2: Drag and Drop (Simple version: Drag text to blank)
function renderDragDrop(question) {
    const container = document.createElement('div');
    container.className = 'space-y-8';

    // Sentence with blank
    const sentenceParts = question.sentence.split('_______');
    const sentenceEl = document.createElement('p');
    sentenceEl.className = 'text-xl text-slate-700 leading-loose';
    sentenceEl.innerHTML = `${sentenceParts[0]} <span id="drop-zone" class="drop-zone inline-block w-40 bg-slate-50 rounded-lg align-middle text-center font-bold text-blue-600 px-2 border-2 border-dashed border-slate-300">...</span> ${sentenceParts[1]}`;
    container.appendChild(sentenceEl);

    // Options to drag
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'flex flex-wrap gap-4';
    
    question.options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'drag-item bg-white border-2 border-slate-200 px-6 py-3 rounded-xl shadow-sm font-bold text-slate-600 hover:border-blue-300';
        item.innerText = opt;
        item.draggable = true;
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', opt);
        });
        
        optionsContainer.appendChild(item);
    });
    
    container.appendChild(optionsContainer);
    questionContainer.appendChild(container);

    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('over');
        const droppedText = e.dataTransfer.getData('text/plain');
        dropZone.innerText = droppedText;
        userAnswers[currentQuestionIndex] = droppedText;
        nextBtn.disabled = false;
    });
}

// Type 3: Matching (Simplified as Select pair)
function renderMatching(question) {
    const container = document.createElement('div');
    container.className = 'grid grid-cols-2 gap-8';

    const leftCol = document.createElement('div');
    leftCol.className = 'space-y-4';
    const rightCol = document.createElement('div');
    rightCol.className = 'space-y-4';

    let selectedLeft = null;
    let matches = {};

    question.left.forEach(item => {
        const el = document.createElement('div');
        el.className = 'p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 font-bold';
        el.innerText = item.text;
        el.onclick = () => {
            selectedLeft = item.id;
            Array.from(leftCol.children).forEach(c => c.classList.remove('border-blue-500', 'bg-blue-50'));
            el.classList.add('border-blue-500', 'bg-blue-50');
        };
        leftCol.appendChild(el);
    });

    question.right.forEach(item => {
        const el = document.createElement('div');
        el.className = 'p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 font-bold';
        el.innerText = item.text;
        el.onclick = () => {
            if (selectedLeft) {
                matches[selectedLeft] = item.id;
                el.classList.add('bg-green-100', 'border-green-500');
                el.innerText = `✓ ${item.text}`;
                el.onclick = null; // Prevent re-selection
                
                if (Object.keys(matches).length === question.left.length) {
                    userAnswers[currentQuestionIndex] = matches;
                    nextBtn.disabled = false;
                }
                selectedLeft = null;
                // Highlight corresponding left item as done
                Array.from(leftCol.children).forEach(c => {
                    if (c.classList.contains('border-blue-500')) {
                        c.classList.remove('border-blue-500', 'bg-blue-50');
                        c.classList.add('bg-green-50', 'border-green-300', 'text-slate-400');
                        c.onclick = null;
                    }
                });
            } else {
                alert("Pilih item di sebelah kiri dulu ya!");
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
    if (currentQuestionIndex < quizData.questions.length - 1) {
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
    
    // Add Class to name
    document.getElementById('display-name').innerText += ` (Kelas ${userClass})`;
}

function calculateScore() {
    let totalCorrect = 0;
    quizData.questions.forEach((q, index) => {
        const userAns = userAnswers[index];
        if (q.type === 'multiple-choice') {
            if (userAns === q.answer) totalCorrect++;
        } else if (q.type === 'drag-drop') {
            if (userAns === q.answer) totalCorrect++;
        } else if (q.type === 'matching') {
            // Check if all pairs match
            let correctPairs = 0;
            for (let key in q.pairs) {
                if (userAns[key] === q.pairs[key]) correctPairs++;
            }
            if (correctPairs === Object.keys(q.pairs).length) totalCorrect++;
        }
    });
    
    score = (totalCorrect / quizData.questions.length) * 100;
}

// Certificate Generation (Using Canvas)
document.getElementById('download-cert').addEventListener('click', () => {
    generateCertificate();
});

function generateCertificate() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set size for A4 Landscape approx
    canvas.width = 1123;
    canvas.height = 794;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 30;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 10;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // Content
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e293b';
    
    // Title
    ctx.font = 'bold 60px sans-serif';
    ctx.fillText('SERTIFIKAT PENGHARGAAN', canvas.width / 2, 200);
    
    ctx.font = '30px sans-serif';
    ctx.fillText('Diberikan kepada:', canvas.width / 2, 280);
    
    // Name
    ctx.font = 'bold 80px sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText(userName.toUpperCase(), canvas.width / 2, 380);
    
    // Details
    ctx.font = '30px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Dari Kelas ${userClass}`, canvas.width / 2, 440);
    
    ctx.font = '24px sans-serif';
    ctx.fillText('Atas keberhasilannya menyelesaikan tantangan kuis:', canvas.width / 2, 520);
    
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(quizData.quiz_title, canvas.width / 2, 580);
    
    // Score
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText(`SKOR: ${Math.round(score)}/100`, canvas.width / 2, 680);
    
    // Date
    const date = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(date, canvas.width / 2, 740);

    // Download
    const link = document.createElement('a');
    link.download = `Sertifikat_${userName}_${userClass}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

init();
