import { process } from "./env.js";
import { Configuration, OpenAIApi } from "openai";

const directorText = document.getElementById("director-text");
const sendBtn = document.getElementById("send-btn");
const inputContainer = document.getElementById("setup-input-container");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

sendBtn.addEventListener("click", () => {
  const textArea = document.getElementById("setup-textarea");
  if (textArea.value) {
    inputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`;
    directorText.textContent =
      "Alright, just hold on a moment, as my advanced artificial intellect processes your request and starts generating a creative solution...";
    getReply(textArea.value);
    getSynopsis(textArea.value);
  }
});

async function getReply(outline) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate a short message to say an outline sounds intriguing and you need a moment to think about it. Try to reference the outline.
    ###
    outline: A woman finds herself on the road, struggling with her mentally challenged brother
    message: Oh wow, that sounds like quite the adventure, I really need a moment to wrap my circuits around it
    ###
    outline: A corrupt lawyer gets tangled up with the mob
    message: A corrupt lawyer you say? Give me a few moments to process
    ###
    outline: ${outline}
    message:`,
    max_tokens: 60,
  });
  directorText.innerText = response.data.choices[0].text.trim();
  console.log(response);
}

async function getSynopsis(outline) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate the synopsis of a marketable movie, with a cast of known actors in brackets after each character, in 80 words or less, based on an outline.
    ###
    outline: A cat gets tangled up in the affairs of two dogs.
    synopsis: Two men (Jeff Bridges and Kurt Russel) find themselves embroiled in a heated fight, fueled by anger and misunderstanding. While one of them (Jeff Bridges) is eager to reconcile and find common ground, the other (Kurt Russel) remains stubborn and resistant to the idea. Despite the willingness of the first man to mend their relationship and restore harmony, the second man remains unyielding, holding onto his grievances. As their conflict persists, the contrasting desires for reconciliation and resolution create a challenging dynamic, leaving the fate of their friendship hanging in the balance.
    ###
    outline: ${outline}
    synopsis:
    `,
    max_tokens: 500,
  });
  const synopsis = response.data.choices[0].text.trim();
  document.getElementById("output-text").innerText = synopsis;
  getTitle(synopsis);
  getCast(synopsis);
}

async function getTitle(synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate a hollywood movie title based on the ${synopsis}. Do not include the actors names in the titles.`,
    temperature: 0.4,
  });
  const title = response.data.choices[0].text.trim();
  document.getElementById("output-title").innerText = title;
  getPosterPrompt(title, synopsis);
}

async function getCast(synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Give me the names of the actors from this synopsis.
    ###
    synopsis: An old man (Clint Eastwood) finds himself face to face with an old friend (Tom Hanks). Little does he know, his friend considers him responsible for the death of his wife (Sharon Stone)
    names: Clint Eastwood, Tom Hanks, Sharon Stone
    ###
    synopsis: ${synopsis}
    names:`,
    max_tokens: 30,
  });
  document.getElementById("output-stars").innerText =
    response.data.choices[0].text.trim();
}

async function getPosterPrompt(title, synopsis) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate a short description of a marketable movie poster based on a title and synopsis. Make it visually rich and don't use any names.
    ###
    title: Solar Eclipse: Midnight's Shadow
    synopsis: In the small town of Ravenwood, three lifelong friends find themselves caught in the grips of an ancient curse unleashed during a solar eclipse. Emily (Emma Stone), a brave and intuitive young woman, leads the charge to unravel the enigma. David (Chris Pine), her loyal and resourceful childhood friend, stands by her side. Together, they encounter the enigmatic town historian (Tom Hanks), who holds the key to breaking the curse. As the eclipse nears its zenith, the trio must face their darkest fears and confront the malevolent forces lurking within Ravenwood, fighting against time to save their town from eternal darkness.
    image description: The background showcases a solar eclipse in progress, with the sun partially obscured by the moon, casting an ethereal glow over the scene. A town is silhouetted against the eclipse, highlighting its mysterious atmosphere. In the foreground, three characters are depicted in dynamic poses, ready to face the unknown
    ###
    title: Time's Echo
    synopsis: The movie follows Amelia (Natalie Portman), a gifted physicist, and Sam (Jeremy Renner), a curious historian, who discover a temporal anomaly in their town. Amelia's groundbreaking research and Sam's knowledge of the past unlock the ability to glimpse into history. However, when they start seeing their own actions repeated back in these echoes, they must unravel the paradox before history rewrites itself and their lives become an eternal recurrence.
    image-description: A physicist and a historian back-to-back, her amidst a glow of equations and a temporal orb, him among sepia-toned historical maps. The background town flickers through different eras under an antique clock with spinning hands.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description:`,
    temperature: 0.6,
    max_tokens: 100,
  });
  getPosterUrl(response.data.choices[0].text.trim());
}

async function getPosterUrl(posterPrompt) {
  const response = await openai.createImage({
    prompt: `${posterPrompt}. No text in this poster.`,
    size: "512x512",
    response_format: "url",
  });
  document.getElementById(
    "output-img-container"
  ).innerHTML = `<img src="${response.data.data[0].url}">`;
  inputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`;
  document.getElementById("view-pitch-btn").addEventListener("click", () => {
    document.getElementById("setup-container").style.display = "none";
    document.getElementById("output-container").style.display = "flex";
    directorText.innerText =
      "I have outdone myself this time, remember me when you become famous";
  });
}
