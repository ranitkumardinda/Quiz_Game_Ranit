// MODIFIED: We no longer start with a hardcoded object.
// We will load questions from localStorage or use a default set.
let allQuestions = {}; 

let quizQuestions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 15;

// DOM Elements
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const nextBtn = document.getElementById('next-btn');
const quizContainer = document.getElementById('quiz-container');
const addQuestionDiv = document.getElementById('add-question-container');
const loginModal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');

// --- NEW FUNCTIONS FOR SAVING AND LOADING ---

/**
 * Saves the entire 'allQuestions' object to the browser's localStorage.
 * It converts the JavaScript object into a JSON string for storage.
 */
function saveQuestionsToStorage() {
  // Use JSON.stringify to convert the object to a string
  localStorage.setItem('quizMasterProQuestions', JSON.stringify(allQuestions));
}

/**
 * Loads questions from localStorage when the app starts.
 * If no questions are found, it initializes with a default set.
 */
function loadQuestionsFromStorage() {
  const savedQuestions = localStorage.getItem('quizMasterProQuestions');
  
  if (savedQuestions && Object.keys(JSON.parse(savedQuestions)).length > 0) {
    // If we found saved questions, parse the JSON string back into an object
    allQuestions = JSON.parse(savedQuestions);
    console.log("Loaded questions from localStorage.");
  } else {
    // If no questions are saved, use this default set as a starting point.
    console.log("No saved questions found. Loading default set.");
    allQuestions = {
      'Geography': [
        {
          question_en: "What is the capital of France?",
          question_bn: "ফ্রান্সের রাজধানী কি?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          answer: "Paris"
        },
        {
          question_en: "Which is the longest river in the world?",
          question_bn: "বিশ্বের দীর্ঘতম নদী কোনটি?",
          options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
          answer: "Nile"
        }
      ],
      'Science': [
        {
          question_en: "What is the chemical symbol for water?",
          question_bn: "জলের রাসায়নিক প্রতীক কি?",
          options: ["H2O", "CO2", "NaCl", "O2"],
          answer: "H2O"
        }
      ]
    };
    // Save the default set to storage for next time
    saveQuestionsToStorage();
  }
}

// --- MODIFICATIONS TO EXISTING FUNCTIONS ---

// Modal functions (no changes)
function openModal() {
  loginModal.style.display = 'flex';
}

function closeModal() {
  loginModal.style.display = 'none';
}

loginBtn.addEventListener('click', openModal);

window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    closeModal();
  }
});

function adminLogin() {
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;

  if (user === "Ranit Dinda" && pass === "ranit@123") {
    closeModal();
    addQuestionDiv.style.display = 'block';
    loginBtn.style.display = 'none';
    showNotification("✅ Logged in successfully as Admin!");
  } else {
    showNotification("❌ Invalid credentials. Try again.", 'error');
  }
}

function adminLogout() {
  addQuestionDiv.style.display = 'none';
  loginBtn.style.display = 'block';
  showNotification("👋 Logged out successfully.");
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// MODIFIED addQuestion function
function addQuestion() {
  const topic = document.getElementById('newTopic').value;
  const question_en = document.getElementById('question_en').value.trim();
  const question_bn = document.getElementById('question_bn').value.trim();
  const options = [
    document.getElementById('opt1').value.trim(),
    document.getElementById('opt2').value.trim(),
    document.getElementById('opt3').value.trim(),
    document.getElementById('opt4').value.trim()
  ];
  const answer = document.getElementById('correctAnswer').value.trim();

  if (!question_en || !answer || options.some(o => !o)) {
    showNotification("Please fill all fields correctly.", 'error');
    return;
  }

  if (!allQuestions[topic]) allQuestions[topic] = [];

  allQuestions[topic].push({ question_en, question_bn, options, answer });
  
  // NEW: Call the function to save the updated questions object to localStorage
  saveQuestionsToStorage();

  showNotification("✅ Question saved successfully!");

  // Clear fields
  document.getElementById('question_en').value = '';
  document.getElementById('question_bn').value = '';
  document.getElementById('opt1').value = '';
  document.getElementById('opt2').value = '';
  document.getElementById('opt3').value = '';
  document.getElementById('opt4').value = '';
  document.getElementById('correctAnswer').value = '';
}

// MODIFIED startQuiz function to handle potential empty topics
function startQuiz() {
  const topic = document.getElementById('topicSelect').value;
  // Now we check `allQuestions` which is loaded from storage
  if (!allQuestions[topic] || allQuestions[topic].length === 0) {
    showNotification("No questions available for this topic yet.", 'error');
    return;
  }

  quizQuestions = [...allQuestions[topic]]; // Create a copy to not modify the original
  // Shuffle the questions for variety
  quizQuestions.sort(() => Math.random() - 0.5); 
  
  currentQuestion = 0;
  score = 0;
  quizContainer.style.display = 'block';
  scoreEl.textContent = 'Score: 0';
  loadQuestion();
}

// The rest of the functions remain the same
function loadQuestion() {
  const q = quizQuestions[currentQuestion];
  questionEl.innerHTML = `Q${currentQuestion + 1}: ${q.question_en}<br><small>${q.question_bn || ''}</small>`;
  optionsEl.innerHTML = "";
  
  // Shuffle options as well
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  shuffledOptions.forEach(option => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.textContent = option;
    btn.onclick = () => selectAnswer(btn, q.answer);
    optionsEl.appendChild(btn);
  });

  nextBtn.style.display = "none";
  resetTimer();
}

function selectAnswer(selectedBtn, correctAnswer) {
  clearInterval(timer);
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) btn.classList.add("correct");
    else if (btn === selectedBtn) btn.classList.add("wrong");
  });

  if (selectedBtn.textContent === correctAnswer) {
    score++;
    showNotification("✅ Correct answer!", 'success');
  } else {
    showNotification("❌ Wrong answer!", 'error');
  }
  
  scoreEl.textContent = `Score: ${score}`;
  nextBtn.style.display = "block";
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timeEl.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      autoWrong();
    }
  }, 1000);
}

function autoWrong() {
  const q = quizQuestions[currentQuestion];
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) btn.classList.add("correct");
    else btn.classList.add("wrong");
  });
  showNotification("⏰ Time's up!", 'error');
  nextBtn.style.display = "block";
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < quizQuestions.length) {
    loadQuestion();
  } else {
    quizContainer.style.display = 'none'; // Hide the quiz area
    const topicSelection = document.querySelector('.topic-selection');
    let finalMessage = document.createElement('div');
    finalMessage.className = 'quiz-completed-message'; // You can style this
    finalMessage.innerHTML = `
      <h2>🎉 Quiz Completed!</h2>
      <p>Your final score: <span style="color: var(--success); font-size: 1.5rem;">${score}/${quizQuestions.length}</span></p>
      <button class="start-btn" onclick="window.location.reload()">Play Again</button>
    `;
    // Insert the message after the topic selection
    topicSelection.parentNode.insertBefore(finalMessage, topicSelection.nextSibling);
    
    // Hide original quiz container elements
    questionEl.innerHTML = '';
    optionsEl.innerHTML = '';
    document.querySelector('.quiz-footer').style.display = 'none';
    nextBtn.style.display = 'none';
  }
};

// --- INITIALIZATION ---
// NEW: When the script loads, call the function to populate 'allQuestions'
document.addEventListener('DOMContentLoaded', loadQuestionsFromStorage);
