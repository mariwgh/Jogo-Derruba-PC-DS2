function tocarSom() {
    let audio = document.getElementById('myAudio');
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");


const imagemCPU = 'cpu.png';
const imagemMemoriaRAM = 'memoria-ram.png';
const imagemMonitor = 'monitor.png';
const imagemPlacaMae = 'placa-mae.png';
const imagemMeia = 'meia.png';

const componentes = [
    { nome: 'CPU',          largura: 60,    altura: 60, x: 400, y: 150, imagemSrc: imagemCPU },
    { nome: 'Memoria-RAM',  largura: 60,    altura: 60, x: 400, y: 150, imagemSrc: imagemMemoriaRAM },
    { nome: 'Monitor',      largura: 60,    altura: 60, x: 400, y: 150, imagemSrc: imagemMonitor },
    { nome: 'Placa-mae',    largura: 60,    altura: 60, x: 400, y: 150, imagemSrc: imagemPlacaMae },
    { nome: 'Meia',         largura: 60,    altura: 60, x: 400, y: 150, imagemSrc: imagemMeia }
];


class Sprite {
    constructor({ position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 }, dimensions = { width: 0, height: 0 }, imageSrc, nome }) {
        this.position = position;
        this.velocity = velocity;
        this.dimensions = dimensions;
        this.image = new Image();
        this.image.src = imageSrc;
        this.image.onload = () => this.loaded = true;   // Flag para saber quando a imagem está carregada
        this.loaded = false;                            // Flag para indicar se a imagem foi carregada
        this.nome = nome;
    }

    draw(context) {
        if (this.loaded) {
            // context.fillRect(this.position.x, this.position.y, this.dimension.width, this.dimensions.height)
            context.drawImage(this.image, this.position.x, this.position.y, this.dimensions.width, this.dimensions.height);
        }
    }
 
    update(context) {  
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.position.x < 0) {
            this.position.x = 0; // Limite esquerdo
        }
        if (this.position.x + this.dimensions.width > canvas.width) {
            this.position.x = canvas.width - this.dimensions.width; // Limite direito
        }
        this.draw(context);
    }
}

class ArmaSprite {
    constructor({ position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 }, dimensions = { width: 0, height: 0 }, imageSrc }) {
        this.position = position;
        this.velocity = velocity;
        this.dimensions = dimensions;
        this.image = new Image();
        this.image.src = imageSrc;
        this.image.onload = () => this.loaded = true;   // Flag para saber quando a imagem está carregada
        this.loaded = false;                            // Flag para indicar se a imagem foi carregada
    }

    draw(context) {
        if (this.loaded) {
            // context.fillRect(this.position.x, this.position.y, this.dimension.width, this.dimensions.height)
            context.drawImage(this.image, this.position.x, this.position.y, this.dimensions.width, this.dimensions.height);
        }
    }

    update(context) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw(context);
    }
}


let pontuacao = document.getElementById("pontuacao")
let pontos = 0

let espacoNivel = document.getElementById("nivel")
let nivel = 1
espacoNivel.innerHTML = nivel


class Barra extends Sprite {
    constructor({ position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 }, dimensions = { width: 0, height: 0 }, imageSrc }) {
        super({ position, velocity, dimensions, imageSrc });
        this.tiroLista = [];
    }

    blockCollision(tiro) {
        // a posicao do tiro em y mais a sua dimensao é maior que a posição da superfície (this.position.y), 
        // e a posição do tiro em y é menor que a posição da superfície mais a sua altura (this.position.y + this.dimensions.height),
        // ou seja, verifica se há sobreposição vertical entre o tiro e a superfície

        let verticalCollision = tiro.position.y + tiro.dimensions.height >= this.position.y  &&
                                this.position.y + this.dimensions.height >= tiro.position.y;
        
        let horizontalCollision = tiro.position.x + tiro.dimensions.width >= this.position.x  &&
                                this.position.x + this.dimensions.width >= tiro.position.x;

        console.log(tiro.colidido)

        if (verticalCollision && horizontalCollision && !tiro.colidido) {
            tiro.velocity.y = 0;

            //ve se tem outro embaixo e bota em cima
            const tirosEmBaixo = this.tiroLista.filter(outroTiro => {
                return tiro.position.x + tiro.dimensions.width > outroTiro.position.x  && tiro.position.x - tiro.dimensions.width < outroTiro.position.x
            })
            tiro.position.y -= tiro.dimensions.height * tirosEmBaixo.length

            this.tiroLista.push(tiro);
            tiro.colidido = true;
             
            if (tiro.nome === 'Meia') {
                pontos -= 1;  
            } else {
                pontos += 1; 
            }

        }
    }

    updateTiros() {
        this.tiroLista.forEach(tiro => {
            tiro.velocity.x = this.velocity.x;
        });
    }

    update(context) {
        this.position.x += this.velocity.x;
        this.updateTiros();
        this.draw(context);
    }
}


const barra = new Barra({
    position: { x: 20, y: 550 },
    dimensions: { width: 160, height: 10 },
    imageSrc: 'https://wallpapercave.com/wp/wp11850536.jpg'
});

const arma = new ArmaSprite({
    position: { x: 750, y: 20 },
    dimensions: { width: 40, height: 40 },
    velocity: { x: -8, y: 0 },
    imageSrc: 'https://i.pinimg.com/200x150/ee/b8/4d/eeb84de76084f4ef08f5e184909eb55c.jpg'
});


let atirar = true;
const tiros = [];
let armaMultiplier = 1;


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function dispararTiro() {
    const componenteAleatorio = componentes[Math.floor(Math.random() * componentes.length)];

    tiros.push(new Sprite({
        position: { x: arma.position.x, y: arma.position.y },
        dimensions: { width: componenteAleatorio.largura, height: componenteAleatorio.altura },
        velocity: { x: 0, y: 7 },
        imageSrc: componenteAleatorio.imagemSrc,
        colidido: false,
        nome: componenteAleatorio.nome 
    }));
}


function escreverGameOver() {
    context.fillStyle = 'black';
    context.font = '50px Times New Roman';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    context.fillText('Game Over! Tecle R para reiniciar', centerX, centerY);
}


let escreveuGameOver = false;


function atirarAuto() {
    if (atirar) {
        dispararTiro();
        atirar = false;
        setTimeout(() => {
            atirar = true;
            armaMultiplier += 0.1;
        }, randomInt(1000, 2500));
    }
}

function corrijeLimite() {
    if (barra.position.x < 0) {
        barra.position.x = 0;
    }

    if (barra.position.x + barra.dimensions.width > canvas.width) {
        barra.position.x = canvas.width - barra.dimensions.width;
    }

    if (arma.position.x < 0) {
        arma.velocity.x = 8 * armaMultiplier;
    }

    if (arma.position.x + arma.dimensions.width > canvas.width) {
        arma.velocity.x = -8 * armaMultiplier;
    }
}


function loop() {
    if (timerRestante > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        update();
        requestAnimationFrame(loop);
    }

    else {
        if (pontos >= 15){
            context.fillStyle = 'black';
            context.font = '50px Times New Roman';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            context.fillText('Ganhaste! Tecle R para reiniciar', centerX, centerY);
        }
        else {
            if (!escreveuGameOver) {
                escreverGameOver();
                escreveuGameOver = true;
            }
        }   
    }
}

function update() {
    atirarAuto();

    for (let i = tiros.length - 1; i >= 0; i--) {
        let tiro = tiros[i];
        tiro.update(context);
        barra.blockCollision(tiro);

        // Remove os tiros que saem da tela
        if (tiro.position.y > canvas.height) {
            tiros.splice(i, 1);
        }
    }

    barra.update(context);
    arma.update(context);
    corrijeLimite();

    pontuacao.innerHTML = pontos
}


function proxNivel() {
    pontos = 0;
    pontuacao.innerHTML = pontos;
    timerRestante = 60;
    tiros.length = 0;
    arma.position.x = 750;
    arma.velocity.x = -8;
    escreveuGameOver = false;
    nivel += 1;
    espacoNivel.innerHTML = nivel;
    loop();
}

function resetGame() {
    pontos = 0;
    pontuacao.innerHTML = pontos;
    timerRestante = 60;
    tiros.length = 0;
    arma.position.x = 750;
    arma.velocity.x = -8;
    escreveuGameOver = false;
    nivel = 1;
    espacoNivel.innerHTML = nivel;
    loop();
}

function lidarComTeclaApertada(e) {
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
        barra.velocity.x = 3 * armaMultiplier;
    }

    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        barra.velocity.x = -3 * armaMultiplier;
    }

    if (e.key === " ") {
        dispararTiro();
    }

    if (e.key === "r" || e.key === "R") {
        if (timerRestante <= 0 && pontos >= 15) {
            proxNivel();
        }
        if (timerRestante <= 0 && pontos < 15) {
            resetGame()
        }
    }
}

function lidarComTeclaSolta(e) {
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight" || e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        barra.velocity.x = 0;
    }
}


let timerRestante = 60;
const timerElement = document.getElementById('timerRestante');


function updateTimer() {
    if (timerRestante > 0) {
        timerRestante--;
        timerElement.textContent = timerRestante;
    }
}


setInterval(updateTimer, 1000);


window.addEventListener('keydown', lidarComTeclaApertada);
window.addEventListener('keyup', lidarComTeclaSolta);

loop();