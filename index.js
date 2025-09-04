const API_URL = "https://68b993a66aaf059a5b58094a.mockapi.io/votes";

const options = document.querySelectorAll(".option");
const result = document.querySelector(".results");

let userId = localStorage.getItem("userId");
if (!userId) {
  userId = crypto.randomUUID(); // gera um id único
  localStorage.setItem("userId", userId);
}

async function displayResults() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const allVotes = await response.json();

    // Desafio: Tentar usar reduce ao invés do for tradicional
    let votesCount = {};
    for (let i = 0; i < allVotes.length; i++) {
      const currentVote = allVotes[i];
      const option = currentVote.option;

      if (votesCount[option]) {
        votesCount[option] = votesCount[option] + 1;
      } else {
        votesCount[option] = 1;
      }
    }

    // Desafio: fazer usando template ao invés do innerHTML
    result.innerHTML = `
      <h2>Resultado Parcial</h2>
      <p>🦅 Voar: ${votesCount["fly"] || 0}</p>
      <p>👻 Invisibilidade: ${votesCount["invisibility"] || 0}</p>
      <p>💪 Super Força: ${votesCount["strength"] || 0}</p>
      <p>⚡ Velocidade do Flash: ${votesCount["speed"] || 0}</p>
      <p>🌱 Imortalidade: ${votesCount["immortality"] || 0}</p>
    `;
  } catch (error) {
    console.log("Erro ao exibir resultados:", error);
    result.textContent = "Erro ao carregar resultados";
  }
}

displayResults();

async function vote(option) {
  const superpower = option.value;

  try {
    let userVotes = [];

    const response = await fetch(`${API_URL}?userId=${userId}`, {
      headers: { "content-type": "application/json" },
    });

    if (response.ok) {
      userVotes = await response.json();
    } else if (response.status === 404) {
      userVotes = []; // MockAPI devolve 404 quando não acha nada
    } else {
      throw new Error("Erro na API");
    }

    if (userVotes.length > 0) {
      // User já votou anteriormente -> atualizar o voto do user (PUT)
      const existingVote = userVotes[0];
      console.log(superpower);

      await fetch(`${API_URL}/${existingVote.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          option: superpower,
        }),
      });
    } else {
      // User não votou anteriormente -> criar voto (POST)
      const newVote = {
        userId,
        option: superpower,
        createdAt: new Date(),
      };

      await fetch(API_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newVote),
      });
    }
  } catch (error) {
    console.log("Erro ao votar:", error);
    alert("Ocorreu um erro ao registrar seu voto. Tente novamente.");
  }

  alert(`Você votou em: ${option.textContent}`);

  displayResults();
}

options.forEach((option) => {
  option.addEventListener("click", async () => {
    await vote(option);
  });
});
