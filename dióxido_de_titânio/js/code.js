function showInfo(message)
{   alert(String(message));
}

//questionário interativo (10 perguntas)

const quizData = [
  {pergunta: "Qual é o estado físico do dióxido de titânio à temperatura ambiente?", opcoes: ["Sólido","Líquido","Gasoso"], resposta:"Sólido", infoExtra:"O TiO₂ é um sólido branco cristalino à temperatura ambiente, usado como pigmento devido à sua opacidade."},
  {pergunta:"Qual é a fórmula química do dióxido de titânio?", opcoes:["TiO","TiO₂","Ti₂O₃"], resposta:"TiO₂", infoExtra:"A fórmula TiO₂ indica que cada molécula possui 1 átomo de titânio e 2 átomos de oxigênio."},
  {pergunta:"Qual mineral é a principal fonte industrial do TiO₂?", opcoes:["Ilmenita","Quartzo","Calcita"], resposta:"Ilmenita", infoExtra:"A ilmenita (FeTiO₃) é processada para extrair o dióxido de titânio."},
  {pergunta:"Qual é o tipo de ligação predominante no TiO₂?", opcoes:["Covalente","Iônica","Metálica"], resposta:"Iônica", infoExtra:"O TiO₂ apresenta predominância de ligações iônicas entre Ti⁴⁺ e O²⁻."},
  {pergunta:"Qual a cor do dióxido de titânio em pó?", opcoes:["Branco","Amarelo","Azul"], resposta:"Branco", infoExtra:"O TiO₂ é branco e altamente opaco, usado como pigmento."},
  {pergunta:"O TiO₂ é solúvel em água?", opcoes:["Sim","Não"], resposta:"Não", infoExtra:"O TiO₂ é insolúvel em água, mas solúvel em ácidos fortes como ácido sulfúrico."},
  {pergunta:"Qual é a densidade aproximada do TiO₂ na forma de rutilo?", opcoes:["~2 g/cm³","~4.23 g/cm³","~7 g/cm³"], resposta:"~4.23 g/cm³", infoExtra:"A densidade do rutilo é cerca de 4,23 g/cm³."},
  {pergunta:"Qual é o ponto de fusão aproximado do TiO₂?", opcoes:["~843 °C","~1.843 °C","~2.972 °C"], resposta:"~1.843 °C", infoExtra:"O ponto de fusão elevado permite suportar altas temperaturas industriais."},
  {pergunta:"Em que século o uso do TiO₂ como pigmento se popularizou?", opcoes:["Século XIX","Século XX","Século XVIII"], resposta:"Século XX", infoExtra:"No século XX, o TiO₂ substituiu pigmentos tóxicos à base de chumbo."},
  {pergunta:"Qual é a estrutura cristalina mais comum do TiO₂?", opcoes:["Rutilo","Anatásio","Brookita"], resposta:"Rutilo", infoExtra:"O rutilo é a forma cristalina mais estável e mais utilizada industrialmente."}
];

const questionTimer = 3400; //tempo entre as perguntas
let currentQuestion = 0;
let score = 0;

const quizArea = document.getElementById("quiz-area");
const progress = document.getElementById("progress");

//cria barra de progresso visual
const progressBar = document.createElement("div");
progressBar.style.height = "10px";
progressBar.style.background = "#444";
progressBar.style.borderRadius = "5px";
progressBar.style.marginTop = "5px";
const progressFill = document.createElement("div");
progressFill.style.height = "100%";
progressFill.style.width = "0%";
progressFill.style.background = "var(--primary)";
progressFill.style.borderRadius = "5px";
progressBar.appendChild(progressFill);
quizArea.appendChild(progressBar);

//funçao pra mostrar pergunta
function showQuestion() {
  quizArea.innerHTML = ""; 
  quizArea.appendChild(progressBar);

  const q = quizData[currentQuestion];

  const perguntaEl = document.createElement("p");
  perguntaEl.textContent = q.pergunta;
  perguntaEl.style.fontWeight = "bold";
  perguntaEl.style.marginBottom = "0.5rem";
  quizArea.appendChild(perguntaEl);

  q.opcoes.forEach(op => {
    const btn = document.createElement("button");
    btn.textContent = op;
    btn.style.marginBottom = "0.4rem";
    btn.addEventListener("click", () => checkAnswer(btn, op));
    quizArea.appendChild(btn);
  });

  updateProgress();
}

//checa resposta e mostra feedback
function checkAnswer(button, selected) {
  const q = quizData[currentQuestion];
  const acertou = selected === q.resposta;
  if (acertou) score++;

  // Desativa todos os botões
  const allButtons = quizArea.querySelectorAll("button");
  allButtons.forEach(b => b.disabled = true);

  // Feedback
  const feedback = document.createElement("p");
  feedback.style.marginTop = "0.5rem";
  feedback.style.fontWeight = "bold";
  feedback.style.color = acertou ? "#4CAF50" : "#f44336";
  feedback.textContent = acertou ? "✅ Acertou!" : `❌ Errou! Resposta correta: ${q.resposta}`;
  quizArea.appendChild(feedback);

  //info extra
  const infoEl = document.createElement("p");
  infoEl.style.color = "#ffcc70";
  infoEl.style.marginTop = "0.3rem";
  infoEl.textContent = q.infoExtra;
  quizArea.appendChild(infoEl);

  //próxima pergunta
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    setTimeout(showQuestion, questionTimer);
  } else {
    setTimeout(showFinalScore, questionTimer);
  }
}

//atualiza barra e texto de progresso
function updateProgress() {
  progress.textContent = `${currentQuestion} / ${quizData.length}`;
  const percent = (currentQuestion / quizData.length) * 100;
  progressFill.style.width = percent + "%";
}

//mostra pontuação final
function showFinalScore() {
  quizArea.innerHTML = `<p id='resultado'>🎉 Parabéns! Você completou o questionário.<br>Pontuação final: ${score} / ${quizData.length}</p>`;
  progressFill.style.width = "100%";
  progress.textContent = `${quizData.length} / ${quizData.length}`;
}

//inicializa
showQuestion();

